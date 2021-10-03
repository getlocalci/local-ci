import * as vscode from 'vscode';
import Command from './Command';
import Job from './Job';
import Warning from './Warning';
import getJobs from './utils/getJobs';
import processConfig from './utils/processConfig';
import {
  GET_LICENSE_COMMAND,
  ENTER_LICENSE_COMMAND,
  LICENSE_KEY_STATE,
  PROCESS_FILE_PATH,
  PREVIEW_STARTED_TIMESTAMP,
} from './constants';
import getDockerError from './utils/getDockerError';
import isDockerRunning from './utils/isDockerRunning';
import isLicenseValid from './utils/isLicenseValid';
import isPreviewExpired from './utils/isPreviewExpired';

export default class JobProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  public runningJobs: string[] = [];
  public _onDidChangeTreeData: vscode.EventEmitter<Job | undefined> =
    new vscode.EventEmitter<Job | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Job | undefined> =
    this._onDidChangeTreeData.event;
  constructor(private readonly context: vscode.ExtensionContext) {}

  refresh(job?: Job): void {
    this._onDidChangeTreeData.fire(job);
  }

  getTreeItem(element: Job): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    processConfig();

    const shouldEnableExtension =
      (await isLicenseValid(
        await this.context.secrets.get(LICENSE_KEY_STATE),
        this.context
      )) ||
      !isPreviewExpired(
        this.context.globalState.get(PREVIEW_STARTED_TIMESTAMP)
      );
    return shouldEnableExtension
      ? isDockerRunning()
        ? getJobs(PROCESS_FILE_PATH).map((jobName) => new Job(jobName))
        : [
            new Warning('Error: is Docker running?'),
            new vscode.TreeItem(` ${getDockerError()}`),
          ]
      : [
          new Warning('Please enter a Local CI license key.'),
          new Command('Get License', GET_LICENSE_COMMAND),
          new Command('Enter License', ENTER_LICENSE_COMMAND),
        ];
  }
}
