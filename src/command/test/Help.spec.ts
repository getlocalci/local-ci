import AppTestHarness from 'test-tool/helpers/AppTestHarness';
import FakeEditorGateway from 'gateway/FakeEditorGateway';
import FakeReporterGateway from 'gateway/FakeReporterGateway';
import Help from 'command/Help';

let help: Help;
let editorGateway: FakeEditorGateway;
let reporterGateway: FakeReporterGateway;

describe('Help command', () => {
  beforeEach(() => {
    const testHarness = new AppTestHarness();
    testHarness.init();
    help = testHarness.container.get(Help);
    editorGateway = testHarness.editorGateway;
    reporterGateway = testHarness.reporterGateway;
  });

  test('calls the reporter event', () => {
    const reporterSpy = jest.fn();
    reporterGateway.reporter.sendTelemetryEvent = reporterSpy;

    help.getCallback()();

    expect(reporterSpy).toHaveBeenCalledWith('help');
  });

  test('opens an external link', () => {
    const editorSpy = jest.fn();
    editorGateway.editor.env.openExternal = editorSpy;
    const stubUri = 'https://example.com/stub';
    editorGateway.editor.Uri.parse = () => stubUri;

    help.getCallback()();

    expect(editorSpy).toHaveBeenCalledWith(stubUri);
  });
});
