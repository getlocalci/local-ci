import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import Types from 'common/Types';
import EditorGateway from 'gateway/EditorGateway';
import { EXTENSION_ID, TRIAL_STARTED_TIMESTAMP } from 'constants/';
import ReporterGateway from 'gateway/ReporterGateway';
import Email from 'license/Email';

@injectable()
export default class FirstActivation {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(Types.IReporterGateway)
  reporterGateway!: ReporterGateway;

  @inject(Email)
  email!: Email;

  handle(context: vscode.ExtensionContext) {
    if (!context.globalState.get(TRIAL_STARTED_TIMESTAMP)) {
      context.globalState.update(TRIAL_STARTED_TIMESTAMP, new Date().getTime());
      this.reporterGateway.reporter.sendTelemetryEvent('firstActivation');
      this.email.askForEmail();

      const getStartedText = 'Get started debugging faster';
      this.editorGateway.editor.window
        .showInformationMessage(
          'Thanks for installing Local CI!',
          { detail: 'Getting started with Local CI' },
          getStartedText
        )
        .then((clicked) => {
          if (clicked === getStartedText) {
            this.editorGateway.editor.commands.executeCommand(
              'workbench.action.openWalkthrough',
              `${EXTENSION_ID}#welcomeLocalCi`
            );
            this.reporterGateway.reporter.sendTelemetryEvent(
              'click.getStarted'
            );
          }
        });
    }
  }
}
