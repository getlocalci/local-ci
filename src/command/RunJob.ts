import type vscode from 'vscode';
import type { Command } from '.';
import EditorGateway from 'gateway/EditorGateway';
import JobProvider from 'job/JobProvider';
import JobRunner from 'job/JobRunner';
import JobTreeItem from 'job/JobTreeItem';
import ReporterGateway from 'gateway/ReporterGateway';
import { DO_NOT_CONFIRM_RUN_JOB, RUN_JOB_COMMAND } from 'constant';

export default class RunJob implements Command {
  commandName: string;

  constructor(
    public editorGateway: EditorGateway,
    public jobRunner: JobRunner,
    public reporterGateway: ReporterGateway
  ) {
    this.commandName = RUN_JOB_COMMAND;
  }

  getCallback(context: vscode.ExtensionContext, jobProvider: JobProvider) {
    return async (jobName: string, job?: JobTreeItem) => {
      if (!jobName) {
        this.editorGateway.editor.window.showWarningMessage(
          'Please click a specific job to run it'
        );
        this.editorGateway.editor.commands.executeCommand(
          'workbench.view.extension.localCiDebugger'
        );

        return;
      }

      this.reporterGateway.reporter.sendTelemetryEvent('runJob');

      if (context.globalState.get(DO_NOT_CONFIRM_RUN_JOB)) {
        this.jobRunner.run(context, jobName, jobProvider, job);
        return;
      }

      const confirmText = 'Yes';
      const dontAskAgainText = `Yes, don't ask again`;
      this.editorGateway.editor.window
        .showInformationMessage(
          `Do you want to run the job ${jobName}?`,
          { modal: true },
          { title: confirmText },
          { title: dontAskAgainText }
        )
        .then((selection) => {
          if (
            selection?.title === confirmText ||
            selection?.title === dontAskAgainText
          ) {
            this.jobRunner.run(context, jobName, jobProvider, job);
          }

          if (selection?.title === dontAskAgainText) {
            context.globalState.update(DO_NOT_CONFIRM_RUN_JOB, true);
          }
        });
    };
  }
}
