import * as vscode from 'vscode';
import TelemetryReporter from '@vscode/extension-telemetry';
import sendEnteredEmail from './sendEnteredEmail';
import { EXTENSION_ID } from 'constants/';

export default async function askForEmail(
  reporter: TelemetryReporter
): Promise<void> {
  const enteredEmail = await vscode.window.showInputBox({
    title: 'Email',
    prompt:
      'Could you please enter your email for your free preview of Local CI?',
  });

  if (enteredEmail === undefined) {
    return; // They pressed Escape or exited the input box.
  }

  const enteredName = await vscode.window.showInputBox({
    title: 'Name',
    prompt: `Thanks a lot! What's your first name?`,
  });

  if (enteredName === undefined) {
    sendEnteredEmail(enteredEmail); // They pressed Escape or exited the input box.
    return;
  }

  const yesText = 'Yes';
  const optInSelection = await vscode.window.showQuickPick(['No', yesText], {
    title: `Thanks so much! Can I send you occasional emails with CI/CD tips? You can unsubscribe any time. I'll never share your email.`,
  });
  const optedIntoNewsletter = optInSelection === yesText;
  sendEnteredEmail(enteredEmail, enteredName, optedIntoNewsletter);

  const getStartedText = 'Get started';
  const buttonClicked = await vscode.window.showInformationMessage(
    'Thanks a lot, your free preview has started!',
    { detail: 'Local CI free preview' },
    getStartedText
  );

  if (buttonClicked === getStartedText) {
    vscode.commands.executeCommand(
      'workbench.action.openWalkthrough',
      `${EXTENSION_ID}#welcomeLocalCi`
    );
    reporter.sendTelemetryEvent('click.getStarted');
  }
}
