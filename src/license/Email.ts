import { inject, injectable } from 'inversify';
import { EMAIL_ENDPOINT, EXTENSION_ID } from 'constants/';
import Types from 'common/Types';
import HttpGateway from 'common/HttpGateway';
import EditorGateway from 'common/EditorGateway';
import ReporterGateway from 'common/ReporterGateway';

@injectable()
export default class Email {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(Types.IHttpGateway)
  httpGateway!: HttpGateway;

  @inject(Types.IReporterGateway)
  repoterGateway!: ReporterGateway;

  async askForEmail(): Promise<void> {
    const enteredEmail = await this.editorGateway.editor.window.showInputBox({
      title: 'Email',
      prompt:
        'Could you please enter your email for your free preview of Local CI?',
    });

    if (enteredEmail === undefined) {
      return; // They pressed Escape or exited the input box.
    }

    const enteredName = await this.editorGateway.editor.window.showInputBox({
      title: 'Name',
      prompt: `Thanks a lot! What's your first name?`,
    });

    if (enteredName === undefined) {
      this.sendEnteredEmail(enteredEmail); // They pressed Escape or exited the input box.
      return;
    }

    const yesText = 'Yes';
    const optInSelection = await this.editorGateway.editor.window.showQuickPick(
      ['No', yesText],
      {
        title: `Thanks so much! Can I send you occasional emails with CI/CD tips? You can unsubscribe any time. I'll never share your email.`,
      }
    );
    const optedIntoNewsletter = optInSelection === yesText;
    this.sendEnteredEmail(enteredEmail, enteredName, optedIntoNewsletter);

    const getStartedText = 'Get started';
    const buttonClicked =
      await this.editorGateway.editor.window.showInformationMessage(
        'Thanks a lot, your free preview has started!',
        { detail: 'Local CI free preview' },
        getStartedText
      );

    if (buttonClicked === getStartedText) {
      this.editorGateway.editor.commands.executeCommand(
        'workbench.action.openWalkthrough',
        `${EXTENSION_ID}#welcomeLocalCi`
      );
      this.repoterGateway.reporter.sendTelemetryEvent('click.getStarted');
    }
  }

  async sendEnteredEmail(
    email: string,
    name?: string,
    optedIn?: boolean
  ): Promise<void> {
    await this.httpGateway.post(EMAIL_ENDPOINT, {
      name,
      email,
      optedIn,
    });
  }
}
