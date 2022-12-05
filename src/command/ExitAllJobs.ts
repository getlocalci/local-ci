import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import type { Command } from '.';
import Types from 'common/Types';
import Images from 'containerization/Images';
import EditorGateway from 'gateway/EditorGateway';
import JobProvider from 'job/JobProvider';
import ReporterGateway from 'gateway/ReporterGateway';
import { COMMITTED_IMAGE_NAMESPACE, JOB_TREE_VIEW_ID } from 'constant';

@injectable()
export default class ExitAllJobs implements Command {
  @inject(Images)
  images!: Images;

  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(Types.IReporterGateway)
  reporterGateway!: ReporterGateway;

  commandName: string;

  constructor() {
    this.commandName = `${JOB_TREE_VIEW_ID}.exitAllJobs`;
  }

  getCallback(context: vscode.ExtensionContext, jobProvider: JobProvider) {
    return async () => {
      this.reporterGateway.reporter.sendTelemetryEvent('exitAllJobs');
      jobProvider.hardRefresh();

      const confirmText = 'Yes';
      const selection =
        await this.editorGateway.editor.window.showWarningMessage(
          'Are you sure you want to exit all jobs?',
          { modal: true },
          { title: confirmText }
        );

      if (selection?.title === confirmText) {
        this.editorGateway.editor.window.terminals
          .filter((terminal) => {
            return terminal.name.startsWith('Local CI') && !terminal.exitStatus;
          })
          .forEach((terminal) => {
            terminal.dispose();
          });

        this.images.cleanUp(`${COMMITTED_IMAGE_NAMESPACE}/*`);
      }
    };
  }
}
