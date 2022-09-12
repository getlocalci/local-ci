import { inject, injectable } from 'inversify';
import type { Command } from './index';
import { GET_LICENSE_COMMAND, GET_LICENSE_KEY_URL } from 'constant';
import Types from 'common/Types';
import EditorGateway from 'gateway/EditorGateway';

@injectable()
export default class GetLicense implements Command {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  commandName: string;

  constructor() {
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
