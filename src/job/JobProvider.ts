import * as path from 'path';
import type vscode from 'vscode';
import type Retryer from './Retryer';
import Config from 'config/Config';
import Docker from 'containerization/Docker';
import AllConfigFiles from 'config/AllConfigFiles';
import AllJobs from 'job/AllJobs';
import Children from 'job/Children';
import ConfigFile from 'config/ConfigFile';
import EditorGateway from 'gateway/EditorGateway';
import FsGateway from 'gateway/FsGateway';
import getLogFilesDirectory from 'log/getLogFilesDirectory';
import getTrialLength from 'license/getTrialLength';
import isTrialExpired from 'license/isTrialExpired';
import JobTreeItem from './JobTreeItem';
import License from 'license/License';
import ReporterGateway from 'gateway/ReporterGateway';
import { TRIAL_STARTED_TIMESTAMP } from '../constant';

export enum JobError {
  DockerNotRunning,
  LicenseKey,
  NoConfigFilePathInWorkspace,
  NoConfigFilePathSelected,
  NoFolderOpen,
  ProcessFile,
}

export default class JobProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  onDidChangeTreeData?: vscode.Event<vscode.TreeItem | undefined>;

  private _onDidChangeTreeData?: vscode.EventEmitter<
    vscode.TreeItem | undefined
  >;
  private jobs: string[] = [];
  private errorType?: JobError;
  private errorMessage?: string;
  private logs: Record<string, string[]> = {};
  private runningJob?: string;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly reporterGateway: ReporterGateway,
    private allConfigFiles: AllConfigFiles,
    private children: Children,
    private configFile: ConfigFile,
    private docker: Docker,
    private editorGateway: EditorGateway,
    private fsGateway: FsGateway,
    private license: License,
    private processedConfig: Config,
    private retryer: Retryer,
    private allJobs: AllJobs,
    private jobDependencies?: Map<string, string[] | null>
  ) {
    this._onDidChangeTreeData = new this.editorGateway.editor.EventEmitter<
      vscode.TreeItem | undefined
    >();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  async init() {
    this.retryer.init(() => this.hardRefresh());
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
    this.clearError();

    const configFilePath = await this.configFile.getPath(this.context);
    if (!configFilePath || !this.fsGateway.fs.existsSync(configFilePath)) {
      this.reporterGateway.reporter.sendTelemetryEvent('configFilePath');

      if (!this.editorGateway.editor.workspace.workspaceFolders?.length) {
        this.reporterGateway.reporter.sendTelemetryErrorEvent('noFolderOpen');
        this.setError(JobError.NoFolderOpen);
        return;
      }

      const doExistConfigPaths = !!(
        await this.allConfigFiles.getPaths(this.context)
      ).length;
      if (doExistConfigPaths) {
        this.setError(JobError.NoConfigFilePathSelected);
      } else {
        this.reporterGateway.reporter.sendTelemetryErrorEvent('noConfigFile');
        this.setError(JobError.NoConfigFilePathInWorkspace);
        this.retryer.run();
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

      this.retryer.run();
      return;
    }

    if (processError) {
      this.setError(JobError.ProcessFile, processError);
      this.retryer.run();
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
  }

  clearError() {
    this.errorType = undefined;
    this.errorMessage = undefined;
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
    return this.children.get(
      this.jobs,
      this.logs,
      this.jobDependencies,
      this.runningJob,
      this.errorType,
      this.errorMessage,
      parentElement
    );
  }

  setRunningJob(jobName: string): void {
    this.runningJob = jobName;
  }
}
