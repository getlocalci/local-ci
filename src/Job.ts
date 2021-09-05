import * as vscode from 'vscode';
import * as path from 'path';
import { RUN_JOB_COMMAND } from './constants';

export class Job extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    const tooltip = `Runs the CircleCI® job ${this.label}`;

    this.tooltip = tooltip;
    this.command = {
      title: label,
      command: RUN_JOB_COMMAND,
      tooltip,
      arguments: [label],
    };
  }

  iconPath = {
    light: path.join(
      __filename,
      '..',
      '..',
      'resources',
      'light',
      'folder.svg'
    ),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'folder.svg'),
  };
}
