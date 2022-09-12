import Help from 'command/Help';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import FakeEditorGateway from 'gateway/FakeEditorGateway';
import FakeReporterGateway from 'gateway/FakeReporterGateway';

let help: Help;
let editorGateway: FakeEditorGateway;
let reporterGateway: FakeReporterGateway;

describe('Help', () => {
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

    expect(reporterSpy.mock.lastCall[0]).toEqual('help');
  });

  test('opens an external link', () => {
    const editorSpy = jest.fn();
    editorGateway.editor.env.openExternal = editorSpy;
    const stubUri = 'https://example.com/stub';
    editorGateway.editor.Uri.parse = () => stubUri;

    help.getCallback()();

    expect(editorSpy.mock.lastCall[0]).toEqual(stubUri);
  });
});
