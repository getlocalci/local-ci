import * as fs from 'fs';
import * as vscode from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import Command from './Command';
import Job from './Job';
import Warning from './Warning';
import getJobs from '../utils/getJobs';
import getProcessedConfig from '../utils/getProcessedConfig';
import {
  GET_LICENSE_COMMAND,
  ENTER_LICENSE_COMMAND,
  TRIAL_STARTED_TIMESTAMP,
  JOB_TREE_VIEW_ID,
} from '../constants';
import getAllConfigFilePaths from '../utils/getAllConfigFilePaths';
import getConfigFilePath from '../utils/getConfigFilePath';
import getDockerError from '../utils/getDockerError';
import getProcessFilePath from '../utils/getProcessFilePath';
import getTrialLength from '../utils/getTrialLength';
import isDockerRunning from '../utils/isDockerRunning';
import isLicenseValid from '../utils/isLicenseValid';
import isTrialExpired from '../utils/isTrialExpired';
import writeProcessFile from '../utils/writeProcessFile';
import getJobTreeItems from '../utils/getJobTreeItems';

interface Element {
  type: string;
  label: string;
}

export default class JobProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<Job | undefined> =
    new vscode.EventEmitter<Job | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Job | undefined> =
    this._onDidChangeTreeData.event;
  private jobs: Element[];
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

  getChildren(element: Element): vscode.TreeItem[] | undefined{
    if (!element) {
      return this.jobs.filter((job) => {
        return !this?.jobDependencies.get(job.label);
      }).map((job) => new Job(job.label, false));
    }

    const jobNames = this.jobDependencies?.keys();
    if (!jobNames) {
      return [];
    }

    const children = [];
    for (const jobName of jobNames) {
      if (this.jobDependencies?.get(jobName)?.length && element.label === this.jobDependencies.get(jobName)[this.jobDependencies.get(jobName)?.length - 1]) {
        children.push(jobName);
      }
    }

    return children.map((jobName) =>
      new Job(jobName, false)
    );
  }

  async loadJobs(): Promise<void> {
    const configFilePath = await getConfigFilePath(this.context);
    if (!configFilePath || !fs.existsSync(configFilePath)) {
      this.reporter.sendTelemetryEvent('configFilePath');

      const doExistConfigPaths = !!(await getAllConfigFilePaths(this.context))
        .length;
      if (!doExistConfigPaths) {
        this.reporter.sendTelemetryErrorEvent('noConfigFile');
      }

      this.jobs = [{
        type: 'warning',
        label: 'Error: No jobs found',
      }];
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
    const dockerRunning = isDockerRunning();

    if (shouldEnableExtension && dockerRunning) {
      if (!processError) {
        this.jobDependencies = getJobs(processedConfig);
        this.jobs = [];
        for ( const jobName of this.jobDependencies.keys()) {
          this.jobs.push({type: 'job', label: jobName});
        }
      } else {
        this.jobs = [{
          label:'Error processing the CircleCI config',
          type: 'warning',
        }]
      }

      this.runningJob = undefined;
    }

    if (processError) {
      this.reporter.sendTelemetryErrorEvent('processError');
    }

    if (!dockerRunning) {
      this.reporter.sendTelemetryErrorEvent('dockerNotRunning');
    }

    if (!this.jobs?.length) {
      this.reporter.sendTelemetryErrorEvent('noJobsFound');
    }

    this.jobs = shouldEnableExtension
      ? dockerRunning
        ? this.jobs
        : [{
          type: 'warning',
          label: 'Error: is Docker running?',
        }]
      :
      [{
        type: 'warning',
        label: 'Please enter a Local CI license key',
      }];
  }

  getParent(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getJob(jobName: string): vscode.TreeItem | undefined {
    return this.jobs.find((job) => jobName === (job as Job)?.getJobName());
  }

  setRunningJob(jobName: string): void {
    this.runningJob = jobName;
  }
}
