import ConfigFile from 'config/ConfigFile';
import AppTestHarness from 'test-tools/helper/AppTestHarness';
import EditorGateway from 'gateway/EditorGateway';
import Types from 'common/Types';
import getContextStub from 'test-tools/helper/getContextStub';

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
let configFile: ConfigFile;
let editorGateway: EditorGateway;

describe('ConfigFile', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    configFile = testHarness.container.get(ConfigFile);
    editorGateway = testHarness.container.get(Types.IEditorGateway);
  });

  test('stored config file', async () => {
    editorGateway.editor.workspace.getWorkspaceFolder = jest
      .fn()
      .mockImplementationOnce(() => ({ name: 'example' }));

    expect(
      await configFile.getPath(getMockContext('/home/example/baz'))
    ).toEqual('/home/example/baz');
  });
});
