import * as vscode from 'vscode';
import { SHOW_LOG_FILE_COMMAND } from '../constants';

export default class Log extends vscode.TreeItem {
  constructor(public readonly label: string, public readonly filePath: string) {
    super(label);
    const tooltip = 'Log for CircleCI® job';
    this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    this.command = {
      title: label,
      command: SHOW_LOG_FILE_COMMAND,
      tooltip,
      arguments: [filePath],
    };

    this.iconPath = new vscode.ThemeIcon('output');
    this.tooltip = tooltip;
  }
}
