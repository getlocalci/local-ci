import getContainer from 'test-tool/TestRoot';

describe('Help command', () => {
  test('calls the reporter event', () => {
    const { help, reporterGateway } = getContainer();
    const reporterSpy = jest.fn();
    reporterGateway.reporter.sendTelemetryEvent = reporterSpy;

    help.getCallback()();

    expect(reporterSpy).toHaveBeenCalledWith('help');
  });

  test('opens an external link', () => {
    const { editorGateway, help } = getContainer();
    const editorSpy = jest.fn();
    editorGateway.editor.env.openExternal = editorSpy;
    const stubUri = 'https://example.com/stub';
    // @ts-expect-error stubUri is the wrong type.
    editorGateway.editor.Uri.parse = () => stubUri;

    help.getCallback()();

    expect(editorSpy).toHaveBeenCalledWith(stubUri);
  });
});
