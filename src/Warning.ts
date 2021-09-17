import * as vscode from 'vscode';

export class Warning extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = label;
  }

  iconPath = new vscode.ThemeIcon('warning');
}
