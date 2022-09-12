import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import type { Command } from './index';
import { DO_NOT_CONFIRM_RUN_JOB } from 'constants/';
import Types from 'common/Types';
import JobProvider from 'job/JobProvider';
import ReporterGateway from 'common/ReporterGateway';
import EditorGateway from 'common/EditorGateway';
import JobRunner from 'job/JobRunner';
import JobTreeItem from 'job/JobTreeItem';
import JobTerminals from 'terminal/JobTerminals';

@injectable()
export default class ReRunJob implements Command {
  @inject(JobTerminals)
  jobTerminals!: JobTerminals;

  @inject(JobRunner)
  jobRunner!: JobRunner;

  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(Types.IReporterGateway)
  reporterGateway!: ReporterGateway;

  commandName: string;

  constructor() {
    this.commandName = 'local-ci.job.rerun';
  }

  getCallback(context: vscode.ExtensionContext, jobProvider: JobProvider) {
    return (job: JobTreeItem) => {
      const confirmText = 'Yes';
      const dontAskAgainText = `Yes, don't ask again`;

      if (context.globalState.get(DO_NOT_CONFIRM_RUN_JOB)) {
        this.reRun(context, jobProvider, job);
        return;
      }

      this.editorGateway.editor.window
        .showInformationMessage(
          `Do you want to rerun the job ${job.getJobName()}?`,
          { modal: true },
          { title: confirmText },
          { title: dontAskAgainText }
        )
        .then((selection) => {
          if (
            selection?.title === confirmText ||
            selection?.title === dontAskAgainText
          ) {
            this.reRun(context, jobProvider, job);
          }

          if (selection?.title === dontAskAgainText) {
            context.globalState.update(DO_NOT_CONFIRM_RUN_JOB, true);
          }
        });
    };
  }

  async reRun(
    context: vscode.ExtensionContext,
    jobProvider: JobProvider,
    job: JobTreeItem
  ) {
    this.reporterGateway.reporter.sendTelemetryEvent('rerunJob');
    this.jobTerminals.dispose(job.getJobName());
    this.jobRunner.run(context, job.getJobName(), jobProvider, job);
  }
}
