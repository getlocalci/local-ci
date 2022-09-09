import Workspace from 'common/Workspace';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import FakeEditorGateway from 'common/FakeEditorGateway';

let testHarness: AppTestHarness;
let workspace: Workspace;
let editorGateway: FakeEditorGateway;

describe('Workspace', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    workspace = testHarness.container.get(Workspace);
    editorGateway = testHarness.editorGateway;
  });

  test('with no workspaceFolders', () => {
    editorGateway.editor.workspace.workspaceFolders = [];
    expect(workspace.getFirstWorkspaceRootPath()).toEqual('');
  });

  test('Wwith workspaceFolders', () => {
    const path = 'example';
    editorGateway.editor.workspace.workspaceFolders = [
      {
        uri: { path },
      },
    ];

    expect(workspace.getFirstWorkspaceRootPath()).toEqual(path);
  });
});
