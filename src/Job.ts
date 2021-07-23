import * as vscode from 'vscode';
import * as path from 'path';

export class Job extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    const tooltip = `Runs the CircleCI job ${this.label}`;

    this.tooltip = tooltip;
    this.command = {
      title: label,
      command: 'localci.runAction',
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
