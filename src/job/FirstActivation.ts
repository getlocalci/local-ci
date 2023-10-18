import type vscode from 'vscode';
import EditorGateway from 'gateway/EditorGateway';
import Email from 'license/Email';
import ReporterGateway from 'gateway/ReporterGateway';
import { EXTENSION_ID, TRIAL_STARTED_TIMESTAMP } from 'constant';

export default class FirstActivation {
  constructor(
    public editorGateway: EditorGateway,
    public reporterGateway: ReporterGateway,
    public email: Email
  ) {}

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
