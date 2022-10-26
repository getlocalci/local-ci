import type vscode from 'vscode';

/**
 * TreeItem for a native VS Code command.
 *
 * Simpler, as this doesn't have a running state,
 * and doesn't pass arguments to command.
 */
export default class NativeCommandTreeItem implements vscode.TreeItem {
  command: vscode.Command;
  tooltip: string;

  constructor(public label: string, commandName: string) {
    this.tooltip = label;
    this.command = {
      command: commandName,
      title: label,
      tooltip: label,
    };
  }
}
