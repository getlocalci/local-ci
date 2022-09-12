import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import { SELECTED_CONFIG_PATH } from 'constants/';
import Types from 'common/Types';
import JobProvider from 'job/JobProvider';
import ReporterGateway from 'gateway/ReporterGateway';
import EditorGateway from 'gateway/EditorGateway';

@injectable()
export default class DebugRepo {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(Types.IReporterGateway)
  reporterGateway!: ReporterGateway;

  commandName: string;

  constructor() {
    this.commandName = 'local-ci.debug.repo';
  }

  getCallback(context: vscode.ExtensionContext, jobProvider: JobProvider) {
    return (clickedFile: vscode.Uri) => {
      this.reporterGateway.reporter.sendTelemetryEvent('click.debugRepo');
      if (clickedFile.fsPath) {
        context.globalState
          .update(SELECTED_CONFIG_PATH, clickedFile.fsPath)
          .then(() => {
            jobProvider.hardRefresh();
            this.editorGateway.editor.commands.executeCommand(
              'workbench.view.extension.localCiDebugger'
            );
          });
      }
    };
  }
}
