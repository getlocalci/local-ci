import CreateConfigFile from 'command/CreateConfigFile';
import EditorGateway from 'gateway/EditorGateway';
import ReporterGateway from 'gateway/ReporterGateway';
import getContextStub from 'test-tool/helper/getContextStub';
import JobProviderFactory from 'job/JobProviderFactory';
import container from 'common/TestAppRoot';

let createConfigFile: CreateConfigFile;
let editorGateway: EditorGateway;
let jobProviderFactory: JobProviderFactory;
let reporterGateway: ReporterGateway;

describe('CreateConfigFile command', () => {
  beforeEach(() => {
    createConfigFile = container.createConfigFile;
    editorGateway = container.editorGateway;
    reporterGateway = container.reporterGateway;
    jobProviderFactory = container.jobProviderFactory;
  });

  test('creates the config when there is a workspace folder', async () => {
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
