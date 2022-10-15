import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import Types from 'common/Types';
import EditorGateway from 'gateway/EditorGateway';

@injectable()
export default class WarningFactory {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  create(label: string, command?: string): vscode.TreeItem {
    const warning = new this.editorGateway.editor.TreeItem(
      label,
      this.editorGateway.editor.TreeItemCollapsibleState.None
    );
    warning.tooltip = label;
    warning.iconPath = new this.editorGateway.editor.ThemeIcon('warning');
    if (command) {
      warning.command = {
        command,
        title: label,
        tooltip: label,
      };
    }

    return warning;
  }
}
