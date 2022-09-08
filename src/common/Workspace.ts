import { decorate, inject, injectable } from 'inversify';
import Types from 'common/Types';
import EditorGateway from './EditorGateway';

class Workspace {
  editorGateway!: EditorGateway;

  /**
   * Gets the absolute path to the 1st VS Code workspace folder.
   *
   * Though there could be several workspace folders.
   */
  getFirstWorkspaceRootPath(): string {
    return this.editorGateway.editor.workspace?.workspaceFolders?.length
      ? this.editorGateway.editor.workspace.workspaceFolders[0]?.uri?.path
      : '';
  }
}

decorate(injectable(), Workspace);
decorate(inject(Types.IEditorGateway), Workspace.prototype, 'editorGateway');
export default Workspace;
