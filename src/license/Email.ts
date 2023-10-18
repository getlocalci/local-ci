import EditorGateway from 'gateway/EditorGateway';
import HttpGateway from 'gateway/HttpGateway';
import ReporterGateway from 'gateway/ReporterGateway';
import { EMAIL_ENDPOINT, EXTENSION_ID } from 'constant';

export default class Email {
  constructor(
    public editorGateway: EditorGateway,
    public httpGateway: HttpGateway,
    public repoterGateway: ReporterGateway
  ) {}

  async askForEmail(): Promise<void> {
    const enteredEmail = await this.editorGateway.editor.window.showInputBox({
      title: 'Email',
      prompt:
        'Could you please enter your email for your free trial of Local CI?',
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
        'Thanks a lot, your free trial has started!',
        { detail: 'Local CI free trial' },
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
