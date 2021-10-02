import * as vscode from 'vscode';

export default class Command extends vscode.TreeItem {
  constructor(public readonly label: string, command: string) {
    super(label);
    this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    this.tooltip = label;
    this.command = {
      command,
      title: label,
      tooltip: label,
    };
  }
}
