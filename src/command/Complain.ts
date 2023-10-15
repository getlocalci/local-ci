import type { Command } from '.';
import EditorGateway from 'gateway/EditorGateway';
import { COMPLAIN_COMMAND, COMPLAIN_URL } from 'constant';

export default class Complain implements Command {
  commandName: string;

  constructor(public editorGateway: EditorGateway) {
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
