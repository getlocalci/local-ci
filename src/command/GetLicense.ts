import type { Command } from '.';
import EditorGateway from 'gateway/EditorGateway';
import { GET_LICENSE_COMMAND, GET_LICENSE_KEY_URL } from 'constant';

export default class GetLicense implements Command {
  commandName: string;

  constructor(public editorGateway: EditorGateway) {
    this.commandName = GET_LICENSE_COMMAND;
  }

  getCallback() {
    return () => {
      this.editorGateway.editor.env.openExternal(
        this.editorGateway.editor.Uri.parse(GET_LICENSE_KEY_URL)
      );
    };
  }
}
