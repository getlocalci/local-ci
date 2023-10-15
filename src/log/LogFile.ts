import EditorGateway from 'gateway/EditorGateway';
import { LOG_FILE_SCHEME } from 'constant';

export default class LogFile {
  constructor(public editorGateway: EditorGateway) {}

  async show(logFilePath: string): Promise<void> {
    await this.editorGateway.editor.window.showTextDocument(
      await this.editorGateway.editor.workspace.openTextDocument(
        this.editorGateway.editor.Uri.parse(`${LOG_FILE_SCHEME}:${logFilePath}`)
      )
    );
  }
}
