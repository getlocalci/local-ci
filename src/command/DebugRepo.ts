import type vscode from 'vscode';
import EditorGateway from 'gateway/EditorGateway';
import JobProvider from 'job/JobProvider';
import ReporterGateway from 'gateway/ReporterGateway';
import { SELECTED_CONFIG_PATH } from 'constant';

export default class DebugRepo {
  commandName: string;

  constructor(
    public editorGateway: EditorGateway,
    public reporterGateway: ReporterGateway
  ) {
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
