import EditorGateway from 'gateway/EditorGateway';

export default class Workspace {
  constructor(public editorGateway: EditorGateway) {}

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
