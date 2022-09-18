import AppTestHarness from 'test-tools/helper/AppTestHarness';
import CreateConfigFile from 'command/CreateConfigFile';
import FakeEditorGateway from 'gateway/FakeEditorGateway';
import FakeReporterGateway from 'gateway/FakeReporterGateway';
import getContextStub from 'test-tools/helper/getContextStub';
import JobProviderFactory from 'job/JobProviderFactory';

let createConfigFile: CreateConfigFile;
let editorGateway: FakeEditorGateway;
let jobProviderFactory: JobProviderFactory;
let reporterGateway: FakeReporterGateway;

describe('CreateConfigFile command', () => {
  beforeEach(() => {
    const testHarness = new AppTestHarness();
    testHarness.init();
    createConfigFile = testHarness.container.get(CreateConfigFile);
    editorGateway = testHarness.editorGateway;
    reporterGateway = testHarness.reporterGateway;
    jobProviderFactory = testHarness.container.get(JobProviderFactory);
  });

  test('creates the config when there is a workspace folder', async () => {
    const reporterSpy = jest.fn();
    reporterGateway.reporter.sendTelemetryEvent = reporterSpy;

    const uri = 'foo/baz/';
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
