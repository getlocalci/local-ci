import ConfigFile from 'config/ConfigFile';
import EditorGateway from 'gateway/EditorGateway';
import getContextStub from 'test-tool/helper/getContextStub';
import getContainer from 'test-tool/TestRoot';

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

let configFile: ConfigFile;
let editorGateway: EditorGateway;

describe('ConfigFile', () => {
  beforeEach(() => {
    const container = getContainer();
    configFile = container.configFile;
    editorGateway = container.editorGateway;
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
