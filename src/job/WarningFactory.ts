import { decorate, inject, injectable } from 'inversify';
import EditorGateway from 'common/EditorGateway';
import * as vscode from 'vscode';
import Types from 'common/Types';

class WarningFactory {
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

decorate(injectable(), WarningFactory);
decorate(
  inject(Types.IEditorGateway),
  WarningFactory.prototype,
  'editorGateway'
);

export default WarningFactory;
