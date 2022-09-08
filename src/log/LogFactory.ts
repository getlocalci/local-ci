import { decorate, inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { SHOW_LOG_FILE_COMMAND } from 'constants/';
import EditorGateway from 'common/EditorGateway';
import Types from 'common/Types';

class LogFactory {
  editorGateway!: EditorGateway;

  create(label: string, filePath: string): vscode.TreeItem {
    const log = new this.editorGateway.editor.TreeItem(label);
    const tooltip = 'Log for CircleCI® job';
    log.collapsibleState =
      this.editorGateway.editor.TreeItemCollapsibleState.None;
    log.command = {
      title: label,
      command: SHOW_LOG_FILE_COMMAND,
      tooltip,
      arguments: [filePath],
    };

    log.iconPath = new this.editorGateway.editor.ThemeIcon('output');
    log.tooltip = tooltip;

    return log;
  }
}

decorate(injectable(), LogFactory);
decorate(inject(Types.IEditorGateway), LogFactory.prototype, 'editorGateway');
export default LogFactory;
