import getContainer from 'test-tool/TestRoot';

describe('Workspace', () => {
  test('with no workspaceFolders', () => {
    const { editorGateway, workspace } = getContainer();

    // @ts-expect-error read-only property.
    editorGateway.editor.workspace.workspaceFolders = [];
    expect(workspace.getFirstWorkspaceRootPath()).toEqual('');
  });

  test('with workspaceFolders', () => {
    const { editorGateway, workspace } = getContainer();
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
