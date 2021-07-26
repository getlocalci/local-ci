import * as vscode from 'vscode';
import { Job } from './Job';
import { getJobs, getRootPath } from './utils';

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
      (await getJobs(`${getRootPath()}/.circleci/config.yml`)).map(
        (jobName) => new Job(jobName, vscode.TreeItemCollapsibleState.None)
      )
    );
  }
}
