import Types from 'common/Types';
import AllConfigFiles from 'config/AllConfigFiles';
import AppTestHarness from 'test-tool/helpers/AppTestHarness';
import FakeEditorGateway from 'gateway/FakeEditorGateway';
import getContextStub from 'test-tool/helpers/getContextStub';

function getMockContext(filePath: string) {
  const initialContext = getContextStub();

  return {
    ...initialContext,
    globalState: {
      ...initialContext.globalState,
      get: () => {
        return filePath;
      },
      update: async () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
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
