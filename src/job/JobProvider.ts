import { injectable } from 'inversify';
import * as path from 'path';
import * as vscode from 'vscode';
import TelemetryReporter from '@vscode/extension-telemetry';
import CommandFactory from './ComandFactory';
import JobFactory from './JobFactory';
import LogFactory from '../log/LogFactory';
import WarningFactory from './WarningFactory';
import AllConfigFiles from 'config/AllConfigFiles';
import getAllJobs from 'job/getAllJobs';
import ConfigFile from 'config/ConfigFile';
import getLogFilesDirectory from 'log/getLogFilesDirectory';
import getTrialLength from 'license/getTrialLength';
import isTrialExpired from 'license/isTrialExpired';
import Docker from 'containerization/Docker';
import Config from 'config/Config';
import {
  CREATE_CONFIG_FILE_COMMAND,
  ENTER_LICENSE_COMMAND,
  GET_LICENSE_COMMAND,
  JOB_TREE_VIEW_ID,
  PROCESS_TRY_AGAIN_COMMAND,
  TRIAL_STARTED_TIMESTAMP,
} from '../constants';
import License from 'license/License';
import FsGateway from 'common/FsGateway';
import EditorGateway from 'common/EditorGateway';

enum JobError {
  DockerNotRunning,
  LicenseKey,
  NoConfigFilePathInWorkspace,
  NoConfigFilePathSelected,
  ProcessFile,
}

@injectable()
export default class JobProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  onDidChangeTreeData?: vscode.Event<vscode.TreeItem | undefined>;

  private _onDidChangeTreeData?: vscode.EventEmitter<
    vscode.TreeItem | undefined
  >;
  private jobs: string[] = [];
  private jobErrorMessage?: string;
  private jobErrorType?: JobError;
  private logs: Record<string, string[]> = {};
  private runningJob?: string;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly reporter: TelemetryReporter,
    private allConfigFiles: AllConfigFiles,
    private configFile: ConfigFile,
    private command: CommandFactory,
    private docker: Docker,
    private editorGateway: EditorGateway,
    private fsGateway: FsGateway,
    private license: License,
    private processedConfig: Config,
    private jobFactory: JobFactory,
    private logFactory: LogFactory,
    private warningFactory: WarningFactory,
    private jobDependencies?: Map<string, string[] | null>
  ) {
    this._onDidChangeTreeData = new this.editorGateway.editor.EventEmitter<
      vscode.TreeItem | undefined
    >();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  async init() {
    await this.loadJobs();
    await this.loadLogs();
  }

  /** Refreshes the TreeView, without processing the config file. */
  async refresh(job?: vscode.TreeItem, skipMessage?: boolean): Promise<void> {
    await this.loadJobs(true, skipMessage);
    await this.loadLogs();
    if (this._onDidChangeTreeData) {
      this._onDidChangeTreeData.fire(job);
    }
  }

  /** Processes the config file(s) and refreshes. */
  async hardRefresh(
    job?: vscode.TreeItem,
    suppressMessage?: boolean
  ): Promise<void> {
    await this.loadJobs(false, suppressMessage);
    await this.loadLogs();
    if (this._onDidChangeTreeData) {
      this._onDidChangeTreeData.fire(job);
    }
  }

  async loadJobs(
    skipConfigProcessing?: boolean,
    skipMessage?: boolean
  ): Promise<void> {
    this.jobs = [];
    this.jobErrorType = undefined;
    this.jobErrorMessage = undefined;
    this.runningJob = undefined;

    const configFilePath = await this.configFile.getPath(this.context);
    if (!configFilePath || !this.fsGateway.fs.existsSync(configFilePath)) {
      this.reporter.sendTelemetryEvent('configFilePath');

      const doExistConfigPaths = !!(
        await this.allConfigFiles.getPaths(this.context)
      ).length;
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
      const configResult = this.processedConfig.process(
        configFilePath,
        this.reporter,
        skipMessage
      );

      processedConfig = configResult.processedConfig;
      processError = configResult.processError;
    }

    const shouldEnableExtension =
      (await this.license.isValid(this.context)) ||
      !isTrialExpired(
        this.context.globalState.get(TRIAL_STARTED_TIMESTAMP),
        getTrialLength(this.context)
      );

    if (!shouldEnableExtension) {
      this.jobErrorType = JobError.LicenseKey;
      return;
    }

    if (!this.docker.isRunning()) {
      this.reporter.sendTelemetryErrorEvent('dockerNotRunning');
      this.jobErrorType = JobError.DockerNotRunning;
      this.jobErrorMessage = this.docker.getError();
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
    const configFilePath = await this.configFile.getPath(this.context);

    for (const jobName of this.jobDependencies?.keys() ?? []) {
      const logDirectory = getLogFilesDirectory(configFilePath, jobName);
      if (this.fsGateway.fs.existsSync(logDirectory)) {
        this.logs[jobName] = this.fsGateway.fs
          .readdirSync(logDirectory)
          .map((logFile) => {
            return path.join(logDirectory, logFile);
          });
      }
    }
  }

  getTreeItem(treeItem: vscode.TreeItem): vscode.TreeItem {
    return treeItem;
  }

  getChildren(parentElement?: vscode.TreeItem): Array<vscode.TreeItem> {
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
      ('getJobName' in parentElement &&
        !this.jobFactory.getJobName(parentElement))
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
        'getJobName' in parentElement
          ? this.jobFactory.getJobName(parentElement)
          : ''
      ),
      ...this.getJobTreeItems(children),
    ];
  }

  getLogTreeItems(jobName: string): vscode.TreeItem[] {
    return (
      this.logs[jobName]?.map((logFile) =>
        this.logFactory.create(path.basename(logFile), logFile)
      ) ?? []
    );
  }

  getJobTreeItems(jobs: string[]): vscode.TreeItem[] {
    return jobs.map((jobName) =>
      this.jobFactory.create(
        jobName,
        jobName === this.runningJob,
        this.hasChild(jobName)
      )
    );
  }

  getErrorTreeItems(): Array<vscode.TreeItem> {
    const errorMessage = this.getJobErrorMessage();

    switch (this.jobErrorType) {
      case JobError.DockerNotRunning:
        return [
          this.warningFactory.create('Error: is Docker running?'),
          new this.editorGateway.editor.TreeItem(errorMessage),
          this.command.create('Try Again', `${JOB_TREE_VIEW_ID}.refresh`),
        ];
      case JobError.LicenseKey:
        return [
          this.warningFactory.create('Please enter a Local CI license key.'),
          this.command.create('Get License', GET_LICENSE_COMMAND),
          this.command.create('Enter License', ENTER_LICENSE_COMMAND),
        ];
      case JobError.NoConfigFilePathInWorkspace:
        return [
          this.warningFactory.create('Error: No .circleci/config.yml found'),
          this.command.create(
            'Create a config for me',
            CREATE_CONFIG_FILE_COMMAND
          ),
        ];
      case JobError.NoConfigFilePathSelected:
        return [
          this.warningFactory.create('Error: No jobs found'),
          this.command.create('Select repo', 'localCiJobs.selectRepo'),
        ];
      case JobError.ProcessFile:
        return [
          this.warningFactory.create('Error processing the CircleCI config:'),
          new this.editorGateway.editor.TreeItem(
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
          this.command.create('Try Again', PROCESS_TRY_AGAIN_COMMAND),
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
