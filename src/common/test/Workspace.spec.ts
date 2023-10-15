import EditorGateway from 'gateway/EditorGateway';
import Workspace from 'common/Workspace';
import container from 'common/TestAppRoot';

let editorGateway: EditorGateway;
let workspace: Workspace;

describe('Workspace', () => {
  beforeEach(() => {
    workspace = container.workspace;
    editorGateway = container.editorGateway;
  });

  test('with no workspaceFolders', () => {
    // @ts-expect-error read-only property.
    editorGateway.editor.workspace.workspaceFolders = [];
    expect(workspace.getFirstWorkspaceRootPath()).toEqual('');
  });

  test('with workspaceFolders', () => {
    const path = 'example';
    // @ts-expect-error read-only property.
    editorGateway.editor.workspace.workspaceFolders = [
      {
        uri: { path },
      },
    ];

    expect(workspace.getFirstWorkspaceRootPath()).toEqual(path);
  });
});
