import * as vscode from 'vscode';
import sendEnteredEmail from './sendEnteredEmail';

export default function askForEmail(): void {
  vscode.window
    .showInputBox({
      title: 'Email',
      prompt:
        'Could you please enter your email for your free preview of Local CI?',
    })
    .then((enteredEmail) => {
      if (enteredEmail === undefined) {
        return; // They pressed Escape or exited the input box.
      }

      vscode.window
        .showInputBox({
          title: 'Name',
          prompt: `Thanks a lot! What's your first name?`,
        })
        .then((enteredName) => {
          if (enteredName === undefined) {
            sendEnteredEmail(enteredEmail); // They pressed Escape or exited the input box.
            return;
          }

          const yesText = 'Yes';
          vscode.window
            .showQuickPick(['No', yesText], {
              title: `Thanks a lot! Can I send you occasional emails with CI/CD tips? You can unsubscribe any time. I'll never share your email.`,
            })
            .then(async (selection) => {
              const optedIntoNewsletter = selection === yesText;

              vscode.window.showInformationMessage(
                'Thanks a lot, your free preview has started!',
                { detail: 'Local CI free preview' }
              );
              sendEnteredEmail(enteredEmail, enteredName, optedIntoNewsletter);
            });
        });
    });
}
