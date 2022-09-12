import { LOG_FILE_SCHEME } from 'constants/';
import { inject, injectable } from 'inversify';
import Types from 'common/Types';
import EditorGateway from 'common/EditorGateway';

@injectable()
export default class LogFile {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  async show(logFilePath: string): Promise<void> {
    await this.editorGateway.editor.window.showTextDocument(
      await this.editorGateway.editor.workspace.openTextDocument(
        this.editorGateway.editor.Uri.parse(`${LOG_FILE_SCHEME}:${logFilePath}`)
      )
    );
  }
}
