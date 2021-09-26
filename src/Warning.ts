import * as vscode from 'vscode';

export default class Warning extends vscode.TreeItem {
  constructor(public readonly label: string, icon = '', command = '') {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = label;
    if (icon) {
      this.iconPath = new vscode.ThemeIcon(icon);
    }

    if (command) {
      this.command = {
        command,
        title: label,
      };
    }
  }
}
