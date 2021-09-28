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
} from './constants';
import getDockerError from './utils/getDockerError';
import isDockerRunning from './utils/isDockerRunning';
import isLicenseValid from './utils/isLicenseValid';

export default class JobProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  constructor(private readonly context: vscode.ExtensionContext) {}

  private _onDidChangeTreeData: vscode.EventEmitter<Job | undefined | void> =
    new vscode.EventEmitter<Job | undefined | void>();

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Job): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    processConfig();
    return Promise.resolve(
      (await isLicenseValid(
        await this.context.secrets.get(LICENSE_KEY_STATE),
        this.context
      ))
        ? isDockerRunning()
          ? getJobs(PROCESS_FILE_PATH).map(
              (jobName) =>
                new Job(jobName, vscode.TreeItemCollapsibleState.None)
            )
          : [
              new Warning('Error: is Docker running?'),
              new vscode.TreeItem(` ${getDockerError()}`),
            ]
        : [
            new Warning('Please enter a Local CI license key.'),
            new Command('Get License', GET_LICENSE_COMMAND),
            new Command('Enter License', ENTER_LICENSE_COMMAND),
          ]
    );
  }
}
