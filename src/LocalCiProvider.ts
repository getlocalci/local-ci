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

  async getChildren(): Promise<Job[]> {
    const ymlFiles = await this.workspace.findFiles('.circleci/config.yml');
    console.log( ymlFiles );

    type ConfigFile = { jobs: Record<string, unknown> };
    const configFile = yaml.load(fs.readFileSync(ymlFiles[0].fsPath, 'utf8'));
    const jobs = typeof configFile === 'object'
      ? Object.keys((configFile as ConfigFile)?.jobs ?? {})
      : [];

    return Promise.resolve(
      jobs.map(
        jobName => new Job(
          jobName,
          vscode.TreeItemCollapsibleState.None
        )
      )
    );
  }
}
