import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import type { Command } from './index';
import { getBinaryPath } from '../../node/binary';
import EditorGateway from 'gateway/EditorGateway';
import Types from 'common/Types';
import { JOB_TREE_VIEW_ID } from 'constant';

@injectable()
export default class EnterToken implements Command {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  commandName: string;

  constructor() {
    this.commandName = `${JOB_TREE_VIEW_ID}.enterToken`;
  }

  getCallback(context: vscode.ExtensionContext) {
    return () => {
      const terminal = this.editorGateway.editor.window.createTerminal({
        name: 'Enter CircleCI® API Token',
        message: `Please get a CircleCI® API token: https://circleci.com/account/api This will store the token on your local machine, Local CI won't do anything with that token other than run CircleCI jobs. If you'd rather store the token on your own, please follow these instructions to install the CircleCI CLI: https://circleci.com/docs/2.0/local-cli/ Then, run this Bash command: circleci setup. This token isn't necessary for all jobs, so you might not have to enter a token.`,
        iconPath: this.editorGateway.editor.Uri.joinPath(
          context.extensionUri,
          'resources',
          'logo.svg'
        ),
      });
      terminal.show();
      terminal.sendText(`${getBinaryPath()} setup`);
    };
  }
}
