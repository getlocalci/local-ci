import { inject, injectable } from 'inversify';
import EditorGateway from 'gateway/EditorGateway';
import type vscode from 'vscode';
import Types from 'common/Types';

@injectable()
export default class WarningFactory {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

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
