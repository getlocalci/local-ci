import { inject, injectable } from 'inversify';
import type { Command } from './index';
import Types from 'common/Types';
import EditorGateway from 'gateway/EditorGateway';
import { COMPLAIN_COMMAND, COMPLAIN_URL } from 'constant';

@injectable()
export default class Complain implements Command {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  commandName: string;

  constructor() {
    this.commandName = COMPLAIN_COMMAND;
  }

  getCallback() {
    return () => {
      this.editorGateway.editor.env.openExternal(
        this.editorGateway.editor.Uri.parse(COMPLAIN_URL)
      );
    };
  }
}
