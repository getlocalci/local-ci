import EditorGateway from 'gateway/EditorGateway';
import ReporterGateway from 'gateway/ReporterGateway';
import Help from 'command/Help';
import container from 'common/TestAppRoot';

let help: Help;
let editorGateway: EditorGateway;
let reporterGateway: ReporterGateway;

describe('Help command', () => {
  beforeEach(() => {
    help = container.help;
    editorGateway = container.editorGateway;
    reporterGateway = container.reporterGateway;
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
    // @ts-expect-error stubUri is the wrong type.
    editorGateway.editor.Uri.parse = () => stubUri;

    help.getCallback()();

    expect(editorSpy).toHaveBeenCalledWith(stubUri);
  });
});
