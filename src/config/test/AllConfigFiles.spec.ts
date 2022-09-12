/* eslint-disable @typescript-eslint/no-empty-function */
import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import Types from 'common/Types';
import AllConfigFiles from 'config/AllConfigFiles';
import FakeEditorGateway from 'gateway/FakeEditorGateway';

function getMockContext(filePath: string) {
  const initialContext = Substitute.for<vscode.ExtensionContext>();

  return {
    ...initialContext,
    globalState: {
      ...initialContext.globalState,
      get: () => {
        return filePath;
      },
      update: async () => {},
    },
  };
}

let testHarness: AppTestHarness;
let allConfigFiles: AllConfigFiles;
let editorGateway: FakeEditorGateway;

describe('AllConfigFiles', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    allConfigFiles = testHarness.container.get(AllConfigFiles);
    editorGateway = testHarness.container.get(Types.IEditorGateway);
  });

  test('stored config file', async () => {
    const selectedFilePath = '/baz/bar/ex';
    editorGateway.editor.workspace.findFiles = () =>
      Promise.resolve([
        { fsPath: '/path/to/here' },
        { fsPath: selectedFilePath },
      ]);
    editorGateway.editor.workspace.asRelativePath = (path: string) => path;

    const actual = await allConfigFiles.getPaths(
      getMockContext(selectedFilePath)
    );

    expect(actual[0].fsPath).toEqual(selectedFilePath);
    expect(actual[0].label);
    expect(actual[0].description);
  });
});
