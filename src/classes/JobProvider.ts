import * as fs from 'fs';
import * as vscode from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import Job from './Job';
import getJobs from '../utils/getJobs';
import getProcessedConfig from '../utils/getProcessedConfig';
import {
  ENTER_LICENSE_COMMAND,
  GET_LICENSE_COMMAND,
  JOB_TREE_VIEW_ID,
  TRIAL_STARTED_TIMESTAMP,
} from '../constants';
import getAllConfigFilePaths from '../utils/getAllConfigFilePaths';
import getConfigFilePath from '../utils/getConfigFilePath';
import getProcessFilePath from '../utils/getProcessFilePath';
import getTrialLength from '../utils/getTrialLength';
import isDockerRunning from '../utils/isDockerRunning';
import isLicenseValid from '../utils/isLicenseValid';
import isTrialExpired from '../utils/isTrialExpired';
import writeProcessFile from '../utils/writeProcessFile';
import Warning from './Warning';
import Command from './Command';
import getDockerError from '../utils/getDockerError';

interface TreeElement {
  label: string;
}

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
  private jobs: string[];
  private jobErrorType: JobError | undefined;
  private jobErrorMessage: string | undefined;
  private runningJob: string | undefined;
  private jobDependencies: Map<string, string[] | null> | undefined;
  private suppressMessage: boolean | undefined;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly reporter: TelemetryReporter
  ) {
    this.jobs = [];
  }

  async refresh(job?: Job, suppressMessage?: boolean): Promise<void> {
    await this.loadJobs();
    this.suppressMessage = suppressMessage;
    this._onDidChangeTreeData.fire(job);
  }

  getTreeItem(element: Job): vscode.TreeItem {
    return element;
  }

  getChildren(parentElement: TreeElement): vscode.TreeItem[] | undefined {
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
      // This element's children should be the jobs that list it as their last dependency.
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
    switch (this.jobErrorType) {
      case JobError.processFile:
        return [
          new Warning('Error processing the CircleCI config:'),
          new vscode.TreeItem(this.getJobErrorMessage()),
          new Command('Try Again', `${JOB_TREE_VIEW_ID}.refresh`),
        ];
      case JobError.dockerNotRunning:
        return [
          new Warning('Error: is Docker running?'),
          new vscode.TreeItem(`${this.getJobErrorMessage()}`),
          new Command('Try Again', `${JOB_TREE_VIEW_ID}.refresh`),
        ];
      case JobError.licenseKey:
        return [
          new Warning('Please enter a Local CI license key.'),
          new Command('Get License', GET_LICENSE_COMMAND),
          new Command('Enter License', ENTER_LICENSE_COMMAND),
        ];
      case JobError.noConfigFilePathSelected:
        return [
          new Warning('Error: No jobs found'),
          new Command('Select repo', 'localCiJobs.selectRepo'),
        ];
      case JobError.noConfigFilePathInWorkspace:
        return [
          new Warning('Error: No jobs found'),
          new vscode.TreeItem(
            'Please add a .circleci/config.yml to this workspace'
          ),
        ];
      default:
        return [new Warning('Error: No jobs found')];
    }
  }

  getJobErrorMessage(): string {
    return this.jobErrorMessage || '';
  }

  // A job has a child job if any other job has it as the last value in its requires array.
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

  async loadJobs(): Promise<void> {
    this.jobs = [];
    this.jobErrorType = undefined;
    this.jobErrorMessage = undefined;

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
      this.reporter.sendTelemetryErrorEvent('processError');
      this.jobErrorType = JobError.processFile;
      this.jobErrorMessage = processError;
      return;
    }

    this.runningJob = undefined;
    this.jobDependencies = getJobs(processedConfig);
    for (const jobName of this.jobDependencies.keys()) {
      this.jobs.push(jobName);
    }
  }

  setRunningJob(jobName: string): void {
    this.runningJob = jobName;
  }
}
