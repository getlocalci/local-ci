import * as fs from 'fs';
import * as vscode from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import Command from './Command';
import Job from './Job';
import Warning from './Warning';
import getAllConfigFilePaths from '../utils/getAllConfigFilePaths';
import getAllJobs from '../utils/getAllJobs';
import getConfigFilePath from '../utils/getConfigFilePath';
import getTrialLength from '../utils/getTrialLength';
import isDockerRunning from '../utils/isDockerRunning';
import isLicenseValid from '../utils/isLicenseValid';
import isTrialExpired from '../utils/isTrialExpired';
import getDockerError from '../utils/getDockerError';
import prepareConfig from '../utils/prepareConfig';
import {
  CREATE_CONFIG_FILE_COMMAND,
  ENTER_LICENSE_COMMAND,
  GET_LICENSE_COMMAND,
  JOB_TREE_VIEW_ID,
  PROCESS_TRY_AGAIN_COMMAND,
  TRIAL_STARTED_TIMESTAMP,
} from '../constants';

enum JobError {
  dockerNotRunning,
  licenseKey,
  noConfigFilePathInWorkspace,
  noConfigFilePathSelected,
  processFile,
}

export default class JobProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<Job | undefined> =
    new vscode.EventEmitter<Job | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Job | undefined> =
    this._onDidChangeTreeData.event;
  private jobs: string[] = [];
  private jobErrorType: JobError | undefined;
  private jobErrorMessage: string | undefined;
  private runningJob: string | undefined;
  private jobDependencies: Map<string, string[] | null> | undefined;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly reporter: TelemetryReporter
  ) {}

  /**
   * Refreshes the TreeView, without processing the config file.
   */
  async refresh(job?: Job, skipMessage?: boolean): Promise<void> {
    await this.loadJobs(true, skipMessage);
    this._onDidChangeTreeData.fire(job);
  }

  /**
   * Processes the config file(s) in addition to refreshing.
   */
  async hardRefresh(job?: Job, suppressMessage?: boolean): Promise<void> {
    await this.loadJobs(false, suppressMessage);
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

    let processedConfig;
    let processError;

    const configFilePath = await getConfigFilePath(this.context);
    if (!configFilePath || !fs.existsSync(configFilePath)) {
      this.reporter.sendTelemetryEvent('configFilePath');

      const doExistConfigPaths = !!(await getAllConfigFilePaths(this.context))
        .length;
      if (doExistConfigPaths) {
        this.jobErrorType = JobError.noConfigFilePathSelected;
      } else {
        this.reporter.sendTelemetryErrorEvent('noConfigFile');
        this.jobErrorType = JobError.noConfigFilePathInWorkspace;
      }

      return;
    }

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
      this.jobErrorType = JobError.licenseKey;
      return;
    }

    if (!isDockerRunning()) {
      this.reporter.sendTelemetryErrorEvent('dockerNotRunning');
      this.jobErrorType = JobError.dockerNotRunning;
      this.jobErrorMessage = getDockerError();
      return;
    }

    if (processError) {
      this.jobErrorType = JobError.processFile;
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

  getTreeItem(treeItem: vscode.TreeItem): vscode.TreeItem {
    return treeItem;
  }

  getChildren(parentElement: vscode.TreeItem): vscode.TreeItem[] {
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
    if (!jobNames) {
      return [];
    }

    const children = [];
    for (const jobName of jobNames) {
      const jobDependencies = this?.jobDependencies?.get(jobName) ?? [];
      const dependencyLength = jobDependencies?.length;
      // This element's children should be the jobs that list it as their last dependency in the requires array.
      if (
        dependencyLength &&
        parentElement.label === jobDependencies[dependencyLength - 1]
      ) {
        children.push(jobName);
      }
    }

    return this.getJobTreeItems(children);
  }

  getJobTreeItems(jobs: string[]): Job[] {
    return jobs.map(
      (jobName) =>
        new Job(jobName, jobName === this.runningJob, this.hasChildJob(jobName))
    );
  }

  getErrorTreeItems(): vscode.TreeItem[] {
    const errorMessage = this.getJobErrorMessage();

    switch (this.jobErrorType) {
      case JobError.dockerNotRunning:
        return [
          new Warning('Error: is Docker running?'),
          new vscode.TreeItem(errorMessage),
          new Command('Try Again', `${JOB_TREE_VIEW_ID}.refresh`),
        ];
      case JobError.licenseKey:
        return [
          new Warning('Please enter a Local CI license key.'),
          new Command('Get License', GET_LICENSE_COMMAND),
          new Command('Enter License', ENTER_LICENSE_COMMAND),
        ];
      case JobError.noConfigFilePathInWorkspace:
        return [
          new Warning('Error: No .circleci/config.yml found'),
          new Command('Create a config for me', CREATE_CONFIG_FILE_COMMAND),
        ];
      case JobError.noConfigFilePathSelected:
        return [
          new Warning('Error: No jobs found'),
          new Command('Select repo', 'localCiJobs.selectRepo'),
        ];
      case JobError.processFile:
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
   * A job has a child job if any other job has it as the last value in its requires array.
   */
  hasChildJob(jobName: string): boolean {
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
