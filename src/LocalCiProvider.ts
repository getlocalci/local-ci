import * as vscode from 'vscode';
import { Job } from './Job';
import getJobs from './utils/getJobs';
import processConfig from './utils/processConfig';
import { PROCESS_FILE_PATH } from './constants';

export class LocalCiProvider implements vscode.TreeDataProvider<Job> {
  private _onDidChangeTreeData: vscode.EventEmitter<Job | undefined | void> =
    new vscode.EventEmitter<Job | undefined | void>();

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Job): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<Job[]> {
    processConfig();
    return Promise.resolve(
      getJobs(PROCESS_FILE_PATH).map(
        (jobName) => new Job(jobName, vscode.TreeItemCollapsibleState.None)
      )
    );
  }
}
