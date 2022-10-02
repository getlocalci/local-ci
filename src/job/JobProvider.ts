import { injectable } from 'inversify';
import * as path from 'path';
import type vscode from 'vscode';
import CommandFactory from './ComandFactory';
import Config from 'config/Config';
import Docker from 'containerization/Docker';
import AllConfigFiles from 'config/AllConfigFiles';
import AllJobs from 'job/AllJobs';
import ConfigFile from 'config/ConfigFile';
import EditorGateway from 'gateway/EditorGateway';
import FsGateway from 'gateway/FsGateway';
import getLogFilesDirectory from 'log/getLogFilesDirectory';
import getTrialLength from 'license/getTrialLength';
import isTrialExpired from 'license/isTrialExpired';
import JobFactory from './JobFactory';
import JobTreeItem from './JobTreeItem';
import License from 'license/License';
import LogFactory from '../log/LogFactory';
import ReporterGateway from 'gateway/ReporterGateway';
import WarningFactory from './WarningFactory';
import {
  COMPLAIN_COMMAND,
  CREATE_CONFIG_FILE_COMMAND,
  ENTER_LICENSE_COMMAND,
  GET_LICENSE_COMMAND,
  JOB_TREE_VIEW_ID,
  PROCESS_TRY_AGAIN_COMMAND,
  TRIAL_STARTED_TIMESTAMP,
} from '../constant';

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
  private isError?: boolean;
  private errorType?: JobError;
  private errorMessage?: string;
  private logs: Record<string, string[]> = {};
  private runningJob?: string;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly reporterGateway: ReporterGateway,
    private allConfigFiles: AllConfigFiles,
    private configFile: ConfigFile,
    private commandFactory: CommandFactory,
    private docker: Docker,
    private editorGateway: EditorGateway,
    private fsGateway: FsGateway,
    private license: License,
    private processedConfig: Config,
    private jobFactory: JobFactory,
    private logFactory: LogFactory,
    private warningFactory: WarningFactory,
    private allJobs: AllJobs,
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
    if (this._onDidChangeTreeData) {
      this._onDidChangeTreeData.fire(undefined);
    }
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
    job?: JobTreeItem,
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
    this.runningJob = undefined;
    this.resetErrors();

    const configFilePath = await this.configFile.getPath(this.context);
    if (!configFilePath || !this.fsGateway.fs.existsSync(configFilePath)) {
      this.reporterGateway.reporter.sendTelemetryEvent('configFilePath');

      const doExistConfigPaths = !!(
        await this.allConfigFiles.getPaths(this.context)
      ).length;
      if (doExistConfigPaths) {
        this.setError(JobError.NoConfigFilePathSelected);
      } else {
        this.reporterGateway.reporter.sendTelemetryErrorEvent('noConfigFile');
        this.setError(JobError.NoConfigFilePathInWorkspace);
      }

      return;
    }

    let processedConfig;
    let processError;

    if (!skipConfigProcessing) {
      const configResult = this.processedConfig.process(
        configFilePath,
        this.reporterGateway.reporter,
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
      this.setError(JobError.LicenseKey);
      return;
    }

    if (!this.docker.isRunning()) {
      this.reporterGateway.reporter.sendTelemetryErrorEvent('dockerNotRunning');
      this.setError(JobError.DockerNotRunning, this.docker.getError());

      this.retryLater();
      return;
    }

    if (processError) {
      this.setError(JobError.ProcessFile, processError);
      return;
    }

    if (!processedConfig) {
      return;
    }

    this.jobDependencies = this.allJobs.get(processedConfig, configFilePath);
    for (const jobName of this.jobDependencies.keys()) {
      this.jobs.push(jobName);
    }
  }

  setError(errorType: JobError, errorMessage?: string) {
    this.errorType = errorType;
    this.errorMessage = errorMessage;
    this.isError = true;
  }

  resetErrors() {
    this.isError = false;
    this.errorType = undefined;
    this.errorMessage = undefined;
  }

  retryLater() {
    const millisecondsToWait = 10000;
    setInterval(async () => {
      await this.loadJobs();
    }, millisecondsToWait);
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

  getChildren(parentElement?: JobTreeItem): Array<vscode.TreeItem> {
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
      ('getJobName' in parentElement && !parentElement?.getJobName())
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

    switch (this.errorType) {
      case JobError.DockerNotRunning:
        return [
          this.warningFactory.create('Error: is Docker running?'),
          new this.editorGateway.editor.TreeItem(errorMessage),
          this.commandFactory.create(
            'Try Again',
            `${JOB_TREE_VIEW_ID}.refresh`
          ),
          this.commandFactory.create('Complain To Me', COMPLAIN_COMMAND),
        ];
      case JobError.LicenseKey:
        return [
          this.warningFactory.create('Please enter a Local CI license key.'),
          this.commandFactory.create('Get License', GET_LICENSE_COMMAND),
          this.commandFactory.create('Enter License', ENTER_LICENSE_COMMAND),
          this.commandFactory.create('Complain To Me', COMPLAIN_COMMAND),
        ];
      case JobError.NoConfigFilePathInWorkspace:
        return [
          this.warningFactory.create('Error: No .circleci/config.yml found'),
          this.commandFactory.create(
            'Create a config for me',
            CREATE_CONFIG_FILE_COMMAND
          ),
          this.commandFactory.create('Complain to me', COMPLAIN_COMMAND),
        ];
      case JobError.NoConfigFilePathSelected:
        return [
          this.warningFactory.create('Error: No jobs found'),
          this.commandFactory.create('Select repo', 'localCiJobs.selectRepo'),
          this.commandFactory.create('Complain to me', COMPLAIN_COMMAND),
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
          this.commandFactory.create('Try Again', PROCESS_TRY_AGAIN_COMMAND),
          this.commandFactory.create('Complain To Me', COMPLAIN_COMMAND),
        ];
      default:
        return [];
    }
  }

  getJobErrorMessage(): string {
    return this.errorMessage || '';
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
