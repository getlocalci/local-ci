import getContainer from 'test-tool/TestRoot';
import getContextStub from 'test-tool/helper/getContextStub';

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

describe('ConfigFile', () => {
  test('stored config file', async () => {
    const { configFile, editorGateway } = getContainer();
    editorGateway.editor.workspace.getWorkspaceFolder = jest
      .fn()
      .mockImplementationOnce(() => ({ name: 'example' }));

    expect(
      await configFile.getPath(getMockContext('/home/example/baz'))
    ).toEqual('/home/example/baz');
  });
});
