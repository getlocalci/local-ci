import type vscode from 'vscode';
import EditorGateway from 'gateway/EditorGateway';

export default class WarningFactory {
  constructor(public editorGateway: EditorGateway) {}

  create(label: string): vscode.TreeItem {
    const warning = new this.editorGateway.editor.TreeItem(
      label,
      this.editorGateway.editor.TreeItemCollapsibleState.None
    );
    warning.tooltip = label;
    warning.iconPath = new this.editorGateway.editor.ThemeIcon('warning');

    return warning;
  }
}
