import * as vscode from 'vscode';

export default class Warning extends vscode.TreeItem {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = label;
    this.iconPath = new vscode.ThemeIcon('warning');
  }
}
