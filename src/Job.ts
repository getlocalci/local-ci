import * as vscode from 'vscode';
import { RUN_JOB_COMMAND } from './constants';

export class Job extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    const tooltip = `Runs the CircleCI® job ${this.label}`;

    this.tooltip = `Runs the CircleCI® job ${this.label}`;
    this.command = {
      title: label,
      command: RUN_JOB_COMMAND,
      tooltip,
      arguments: [label],
    };
  }

  iconPath = new vscode.ThemeIcon('debug-start');
}
