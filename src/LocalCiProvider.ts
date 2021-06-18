import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Job } from './Job';

export class LocalCiProvider implements vscode.TreeDataProvider<Job> {
  private _onDidChangeTreeData: vscode.EventEmitter<Job | undefined | void> = new vscode.EventEmitter<Job | undefined | void>();

  constructor(private workspace: typeof vscode.workspace) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Job): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Job): Promise<Job[]> {
    const ymlFiles = await this.workspace.findFiles('.circleci/config.yml');
    const jobs = ymlFiles.reduce(
      ( accumulator, ymlFile ) => [
        ...accumulator,
        ...Object.keys(yaml.load(fs.readFileSync(ymlFile.fsPath, 'utf8'))?.jobs ?? {})
      ],
      []
    );

    jobs.push(
      new Job(
        'all',
        vscode.TreeItemCollapsibleState.None
      )
    );

    return Promise.resolve(
      jobs.reduce(
        ( accumulator, jobName ) => [
          ...accumulator,
          new Job(
            jobName,
            vscode.TreeItemCollapsibleState.None
          )
        ],
        []
      )
    );
  }
}
