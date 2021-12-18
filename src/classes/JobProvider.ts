import * as fs from 'fs';
import * as vscode from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import Job from './Job';
import getJobs from '../utils/getJobs';
import getProcessedConfig from '../utils/getProcessedConfig';
import { TRIAL_STARTED_TIMESTAMP } from '../constants';
import getAllConfigFilePaths from '../utils/getAllConfigFilePaths';
import getConfigFilePath from '../utils/getConfigFilePath';
import getProcessFilePath from '../utils/getProcessFilePath';
import getTrialLength from '../utils/getTrialLength';
import isDockerRunning from '../utils/isDockerRunning';
import isLicenseValid from '../utils/isLicenseValid';
import isTrialExpired from '../utils/isTrialExpired';
import writeProcessFile from '../utils/writeProcessFile';

interface Element {
  type: string;
  label: string;
}

enum JobError {
  dockerNotRunning,
  noConfigFilePathInWorkspace,
  noConfigFilePathSelected,
  noJobsFound,
  licenseKey,
  processFile,
}

export default class JobProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<Job | undefined> =
    new vscode.EventEmitter<Job | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Job | undefined> =
    this._onDidChangeTreeData.event;
  private jobs: string[];
  private jobError: JobError | undefined;
  private runningJob: string | undefined;
  private jobDependencies: Map<string, string[] | null> | undefined;
  private suppressMessage: boolean | undefined;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly reporter: TelemetryReporter
  ) {
    this.jobs = [];
    this.loadJobs();
  }

  refresh(job?: Job, suppressMessage?: boolean): void {
    this.suppressMessage = suppressMessage;
    this._onDidChangeTreeData.fire(job);
    this.loadJobs();
  }

  getTreeItem(element: Job): vscode.TreeItem {
    return element;
  }

  getChildren(parentElement: Element): vscode.TreeItem[] | undefined {
    if (!parentElement) {
      // This has no parent element, so it's at the root level.
      // Only include jobs that have no dependency.
      return this.getJobTreeItems(
        this.jobs.filter((jobName) => {
          return !this?.jobDependencies?.get(jobName);
        })
      );
    }

    const jobNames = this.jobDependencies?.keys();
    if (!jobNames) {
      return [];
    }

    const children = [];
    for (const jobName of jobNames) {
      const jobDependencies = this?.jobDependencies?.get(jobName);
      const dependencyLength = jobDependencies?.length;
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

  getErrorTreeItems(): void {}

  hasChildJob(jobName: string): boolean {
    for (const [, possibleChildDependecies] of this?.jobDependencies ?? []) {
      if (
        possibleChildDependecies?.length &&
        jobName ===
          possibleChildDependecies[possibleChildDependecies.length - 1]
      ) {
        return true;
      }
    }

    return false;
  }

  async loadJobs(): Promise<void> {
    this.jobs = [];
    this.jobError = undefined;

    const configFilePath = await getConfigFilePath(this.context);
    if (!configFilePath || !fs.existsSync(configFilePath)) {
      this.reporter.sendTelemetryEvent('configFilePath');
      this.jobError = JobError.noConfigFilePathSelected;

      const doExistConfigPaths = !!(await getAllConfigFilePaths(this.context))
        .length;
      if (!doExistConfigPaths) {
        this.reporter.sendTelemetryErrorEvent('noConfigFile');
        this.jobError = JobError.noConfigFilePathInWorkspace;
      }

      return;
    }

    let processedConfig = '';
    let processError = '';
    try {
      processedConfig = getProcessedConfig(configFilePath);
      writeProcessFile(processedConfig, getProcessFilePath(configFilePath));
    } catch (e) {
      processError = (e as ErrorWithMessage)?.message;
      if (!this.suppressMessage) {
        vscode.window.showErrorMessage(
          `There was an error processing the CircleCI config: ${
            (e as ErrorWithMessage)?.message
          }`
        );
      }

      this.reporter.sendTelemetryErrorEvent('writeProcessFile');
    }

    const shouldEnableExtension =
      (await isLicenseValid(this.context)) ||
      !isTrialExpired(
        this.context.globalState.get(TRIAL_STARTED_TIMESTAMP),
        getTrialLength(this.context)
      );

    if (!shouldEnableExtension) {
      this.jobError = JobError.licenseKey;
      return;
    }

    if (!isDockerRunning()) {
      this.reporter.sendTelemetryErrorEvent('dockerNotRunning');
      this.jobError = JobError.dockerNotRunning;
      return;
    }

    if (processError) {
      this.reporter.sendTelemetryErrorEvent('processError');
      this.jobError = JobError.processFile;
      return;
    }

    this.runningJob = undefined;
    this.jobDependencies = getJobs(processedConfig);
    for (const jobName of this.jobDependencies.keys()) {
      this.jobs.push(jobName);
    }
  }

  getParent(element: Element): Element {
    return element;
  }

  setRunningJob(jobName: string): void {
    this.runningJob = jobName;
  }
}
