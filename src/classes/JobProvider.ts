import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import TelemetryReporter from '@vscode/extension-telemetry';
import Command from './Command';
import Job from './Job';
import Log from './Log';
import Warning from './Warning';
import getAllConfigFilePaths from '../utils/getAllConfigFilePaths';
import getAllJobs from '../utils/getAllJobs';
import getConfigFilePath from '../utils/getConfigFilePath';
import getLogFilesDirectory from '../utils/getLogFilesDirectory';
import getTrialLength from '../utils/getTrialLength';
import isDockerRunning from '../utils/isDockerRunning';
import isLicenseValid from '../utils/isLicenseValid';
import isTrialExpired from '../utils/isTrialExpired';
import getDockerError from '../utils/getDockerError';
import prepareConfig from '../utils/prepareConfig';
import {
  CREATE_CONFIG_FILE_COMMAND,
  DAY_IN_MILLISECONDS,
  ENTER_LICENSE_COMMAND,
  EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS,
  GET_LICENSE_COMMAND,
  JOB_TREE_VIEW_ID,
  PROCESS_TRY_AGAIN_COMMAND,
  TAKE_SURVEY_COMMAND,
  TRIAL_STARTED_TIMESTAMP,
  TRIAL_LENGTH_IN_MILLISECONDS,
} from '../constants';
import shouldOfferSurvey from '../utils/shouldOfferSurvey';
import IconCommand from './IconCommand';

enum JobError {
  DockerNotRunning,
  LicenseKey,
  NoConfigFilePathInWorkspace,
  NoConfigFilePathSelected,
  ProcessFile,
}

export default class JobProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<Job | undefined> =
    new vscode.EventEmitter<Job | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Job | undefined> =
    this._onDidChangeTreeData.event;
  private jobs: string[] = [];
  private jobErrorType?: JobError;
  private jobErrorMessage?: string;
  private runningJob?: string;
  private logs: Record<string, string[]> = {};

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly reporter: TelemetryReporter,
    private jobDependencies?: Map<string, string[] | null>
  ) {}

  async init() {
    await this.loadJobs();
    await this.loadLogs();
  }

  /** Refreshes the TreeView, without processing the config file. */
  async refresh(job?: Job, skipMessage?: boolean): Promise<void> {
    await this.loadJobs(true, skipMessage);
    await this.loadLogs();
    this._onDidChangeTreeData.fire(job);
  }

  /** Processes the config file(s) in addition to refreshing. */
  async hardRefresh(job?: Job, suppressMessage?: boolean): Promise<void> {
    await this.loadJobs(false, suppressMessage);
    await this.loadLogs();
    this._onDidChangeTreeData.fire(job);
  }

  async loadJobs(
    skipConfigProcessing?: boolean,
    skipMessage?: boolean
  ): Promise<void> {
    this.jobs = [];
    this.jobErrorType = undefined;
    this.jobErrorMessage = undefined;
    this.runningJob = undefined;

    const configFilePath = await getConfigFilePath(this.context);
    if (!configFilePath || !fs.existsSync(configFilePath)) {
      this.reporter.sendTelemetryEvent('configFilePath');

      const doExistConfigPaths = !!(await getAllConfigFilePaths(this.context))
        .length;
      if (doExistConfigPaths) {
        this.jobErrorType = JobError.NoConfigFilePathSelected;
      } else {
        this.reporter.sendTelemetryErrorEvent('noConfigFile');
        this.jobErrorType = JobError.NoConfigFilePathInWorkspace;
      }

      return;
    }

    let processedConfig;
    let processError;

    if (!skipConfigProcessing) {
      const configResult = prepareConfig(
        configFilePath,
        this.reporter,
        skipMessage
      );

      processedConfig = configResult.processedConfig;
      processError = configResult.processError;
    }

    const shouldEnableExtension =
      (await isLicenseValid(this.context)) ||
      !isTrialExpired(
        this.context.globalState.get(TRIAL_STARTED_TIMESTAMP),
        getTrialLength(this.context)
      );

    if (!shouldEnableExtension) {
      this.jobErrorType = JobError.LicenseKey;
      return;
    }

    if (!isDockerRunning()) {
      this.reporter.sendTelemetryErrorEvent('dockerNotRunning');
      this.jobErrorType = JobError.DockerNotRunning;
      this.jobErrorMessage = getDockerError();
      return;
    }

    if (processError) {
      this.jobErrorType = JobError.ProcessFile;
      this.jobErrorMessage = processError;
      return;
    }

    if (!processedConfig) {
      return;
    }

    this.jobDependencies = getAllJobs(processedConfig, configFilePath);
    for (const jobName of this.jobDependencies.keys()) {
      this.jobs.push(jobName);
    }
  }

  async loadLogs() {
    const configFilePath = await getConfigFilePath(this.context);

    for (const jobName of this.jobDependencies?.keys() ?? []) {
      const logDirectory = getLogFilesDirectory(configFilePath, jobName);
      if (fs.existsSync(logDirectory)) {
        this.logs[jobName] = fs.readdirSync(logDirectory).map((logFile) => {
          return path.join(logDirectory, logFile);
        });
      }
    }
  }

  getTreeItem(treeItem: vscode.TreeItem): vscode.TreeItem {
    return treeItem;
  }

  getChildren(
    parentElement?: Job | Log
  ): Array<Job | Log | Command | Warning | vscode.TreeItem> {
    if (!parentElement) {
      return this.jobs.length
        ? this.getJobTreeItems(
            this.jobs.filter((jobName) => {
              return !this?.jobDependencies?.get(jobName);
            })
          )
        : this.getErrorTreeItems();
    }

    const jobNames = this.jobDependencies?.keys();
    if (
      !jobNames ||
      ('getJobName' in parentElement && !parentElement.getJobName())
    ) {
      return [];
    }

    const children = [];
    for (const jobName of jobNames) {
      const jobDependencies = this?.jobDependencies?.get(jobName) ?? [];
      const dependencyLength = jobDependencies?.length;
      // This element's children include the jobs that list it as their last dependency in the requires array.
      if (
        dependencyLength &&
        parentElement.label === jobDependencies[dependencyLength - 1]
      ) {
        children.push(jobName);
      }
    }

    return [
      ...this.getLogTreeItems(
        'getJobName' in parentElement ? parentElement.getJobName() : ''
      ),
      ...this.getJobTreeItems(children),
    ];
  }

  getLogTreeItems(jobName: string): Log[] {
    return (
      this.logs[jobName]?.map(
        (logFile) => new Log(path.basename(logFile), logFile)
      ) ?? []
    );
  }

  getJobTreeItems(jobs: string[]): Job[] {
    return jobs.map(
      (jobName) =>
        new Job(jobName, jobName === this.runningJob, this.hasChild(jobName))
    );
  }

  getErrorTreeItems(): Array<vscode.TreeItem | Command | Warning> {
    const errorMessage = this.getJobErrorMessage();
    const licenseKeyTreeItems = [
      new Warning('Please enter a Local CI license key.'),
      new Command('Get License', GET_LICENSE_COMMAND),
      new Command('Enter License', ENTER_LICENSE_COMMAND),
    ];

    switch (this.jobErrorType) {
      case JobError.DockerNotRunning:
        return [
          new Warning('Error: is Docker running?'),
          new vscode.TreeItem(errorMessage),
          new Command('Try Again', `${JOB_TREE_VIEW_ID}.refresh`),
        ];
      case JobError.LicenseKey:
        return shouldOfferSurvey(this.context)
          ? [
              ...licenseKeyTreeItems,
              new IconCommand(
                `Get ${
                  (TRIAL_LENGTH_IN_MILLISECONDS +
                    EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS) /
                  DAY_IN_MILLISECONDS
                } more free days by taking a 2-minute survey`,
                TAKE_SURVEY_COMMAND,
                'rocket'
              ),
            ]
          : licenseKeyTreeItems;
      case JobError.NoConfigFilePathInWorkspace:
        return [
          new Warning('Error: No .circleci/config.yml found'),
          new Command('Create a config for me', CREATE_CONFIG_FILE_COMMAND),
        ];
      case JobError.NoConfigFilePathSelected:
        return [
          new Warning('Error: No jobs found'),
          new Command('Select repo', 'localCiJobs.selectRepo'),
        ];
      case JobError.ProcessFile:
        return [
          new Warning('Error processing the CircleCI config:'),
          new vscode.TreeItem(
            [
              errorMessage?.includes('connection refused') ||
              errorMessage?.includes('timeout')
                ? 'Is your machine connected to the internet?'
                : '',
              errorMessage,
            ]
              .filter((message) => !!message)
              .join(' ')
          ),
          new Command('Try Again', PROCESS_TRY_AGAIN_COMMAND),
        ];
      default:
        return [];
    }
  }

  getJobErrorMessage(): string {
    return this.jobErrorMessage || '';
  }

  /**
   * A job has a child if either:
   *
   * 1. It has a log
   * 2. It's a dependency of another job (another job has it as the last value in its requires array)
   */
  hasChild(jobName: string): boolean {
    if (this.logs[jobName]) {
      return true;
    }

    for (const [, dependecies] of this?.jobDependencies ?? []) {
      if (
        dependecies?.length &&
        jobName === dependecies[dependecies.length - 1]
      ) {
        return true;
      }
    }

    return false;
  }

  setRunningJob(jobName: string): void {
    this.runningJob = jobName;
  }
}
