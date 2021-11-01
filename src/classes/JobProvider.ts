import * as vscode from 'vscode';
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
import getConfigFilePath from '../utils/getConfigFilePath';
import getDockerError from '../utils/getDockerError';
import getProcessFilePath from '../utils/getProcessFilePath';
import isDockerRunning from '../utils/isDockerRunning';
import isLicenseValid from '../utils/isLicenseValid';
import isTrialExpired from '../utils/isTrialExpired';
import writeProcessFile from '../utils/writeProcessFile';
import getLocalVolumePath from '../utils/getLocalVolumePath';

export default class JobProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<Job | undefined> =
    new vscode.EventEmitter<Job | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Job | undefined> =
    this._onDidChangeTreeData.event;
  private jobs: vscode.TreeItem[] | [] = [];
  private runningJob: string | undefined;

  constructor(private readonly context: vscode.ExtensionContext) {}

  refresh(job?: Job): void {
    this._onDidChangeTreeData.fire(job);
  }

  getTreeItem(element: Job): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const configFilePath = await getConfigFilePath(this.context);
    writeProcessFile(
      await getProcessedConfig(this.context, configFilePath),
      getProcessFilePath(configFilePath),
      getLocalVolumePath(configFilePath)
    );

    const shouldEnableExtension =
      (await isLicenseValid(this.context)) ||
      !isTrialExpired(this.context.globalState.get(TRIAL_STARTED_TIMESTAMP));
    const dockerRunning = isDockerRunning();

    if (shouldEnableExtension && dockerRunning) {
      this.jobs = await getJobs(
        this.context,
        getProcessFilePath(await getConfigFilePath(this.context)),
        this.runningJob
      );
      this.runningJob = undefined;
    }

    return shouldEnableExtension
      ? dockerRunning
        ? this.jobs
        : [
            new Warning('Error: is Docker running?'),
            new vscode.TreeItem(`${getDockerError()}`),
            new Command('Try Again', `${JOB_TREE_VIEW_ID}.refresh`),
          ]
      : [
          new Warning('Please enter a Local CI license key.'),
          new Command('Get License', GET_LICENSE_COMMAND),
          new Command('Enter License', ENTER_LICENSE_COMMAND),
        ];
  }

  getJob(jobName: string): vscode.TreeItem | undefined {
    return this.jobs.find((job) => jobName === (job as Job)?.getJobName());
  }

  setRunningJob(jobName: string): void {
    this.runningJob = jobName;
  }
}
