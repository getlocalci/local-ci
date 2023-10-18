import getContextStub from 'test-tool/helper/getContextStub';
import getContainer from 'test-tool/TestRoot';

describe('CreateConfigFile command', () => {
  test('creates the config when there is a workspace folder', async () => {
    const {
      createConfigFile,
      editorGateway,
      reporterGateway,
      jobProviderFactory,
    } = getContainer();
    const reporterSpy = jest.fn();
    reporterGateway.reporter.sendTelemetryEvent = reporterSpy;

    const uri = 'foo/baz/';
    // @ts-expect-error read-only property.
    editorGateway.editor.workspace.workspaceFolders = [
      {
        uri: {
          path: 'example',
          with: () => uri,
        },
      },
    ];

    const writeFileSpy = jest.fn().mockImplementation(async () => null);
    editorGateway.editor.workspace.fs.writeFile = writeFileSpy;

    const showTextDocumentSpy = jest.fn();
    editorGateway.editor.window.showTextDocument = showTextDocumentSpy;

    const context = getContextStub();
    const jobProvider = jobProviderFactory.create(context);
    await createConfigFile.getCallback(context, jobProvider)();

    expect(writeFileSpy).toHaveBeenCalled();
    expect(showTextDocumentSpy).toHaveBeenCalled();
  });
});
