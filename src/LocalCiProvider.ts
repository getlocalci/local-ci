import * as vscode from 'vscode';
import { Job } from './Job';
import getJobs from './utils/getJobs';
import processConfig from './utils/processConfig';
import { PROCESS_FILE_PATH } from './constants';
import getDockerError from './utils/getDockerError';
import isDockerRunning from './utils/isDockerRunning';
import { Warning } from './Warning';

export class LocalCiProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
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
      isDockerRunning()
        ? getJobs(PROCESS_FILE_PATH).map(
            (jobName) => new Job(jobName, vscode.TreeItemCollapsibleState.None)
          )
        : [
            new Warning(
              'Error: is Docker running?',
              vscode.TreeItemCollapsibleState.None
            ),
            new vscode.TreeItem(
              ` ${getDockerError()}`,
              vscode.TreeItemCollapsibleState.None
            ),
          ]
    );
  }
}
