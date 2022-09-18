import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import FakeEditorGateway from 'gateway/FakeEditorGateway';
import Workspace from 'common/Workspace';

let editorGateway: FakeEditorGateway;
let testHarness: AppTestHarness;
let workspace: Workspace;

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
