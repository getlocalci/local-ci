import * as vscode from 'vscode';

export default class Log extends vscode.TreeItem {
  constructor(public readonly label: string, public readonly filePath: string) {
    super(label);
    const tooltip = `Log for CircleCI® job`;
    this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    this.command = {
      title: label,
      command: 'vscode.open',
      tooltip,
      arguments: [filePath],
    };

    this.iconPath = new vscode.ThemeIcon('output');
    this.tooltip = tooltip;
  }
}
