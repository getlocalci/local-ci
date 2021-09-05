import * as vscode from 'vscode';
import { Job } from './Job';
import getJobs from './utils/getJobs';
import getRootPath from './utils/getRootPath';

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
    return Promise.resolve(
      getJobs(`${getRootPath()}/.circleci/config.yml`).map(
        (jobName) => new Job(jobName, vscode.TreeItemCollapsibleState.None)
      )
    );
  }
}
