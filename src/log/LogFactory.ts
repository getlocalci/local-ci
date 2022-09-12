import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import { SHOW_LOG_FILE_COMMAND } from 'constant';
import EditorGateway from 'gateway/EditorGateway';
import Types from 'common/Types';

@injectable()
export default class LogFactory {
  @inject(Types.IEditorGateway)
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
