import EditorGateway from 'gateway/EditorGateway';
import type vscode from 'vscode';

export default class CommandTreeItem implements vscode.TreeItem {
  collapsibleState: vscode.TreeItemCollapsibleState;
  command: vscode.Command;
  iconPath?: vscode.ThemeIcon;
  tooltip: string;

  constructor(
    private editorGateway: EditorGateway,
    public label: string,
    commandName: string
  ) {
    this.collapsibleState =
      this.editorGateway.editor.TreeItemCollapsibleState.None;
    this.tooltip = label;
    this.command = {
      command: commandName,
      title: label,
      tooltip: label,
      arguments: [this],
    };
  }

  setIsRunning() {
    this.iconPath = new this.editorGateway.editor.ThemeIcon('sync~spin');
  }
}
