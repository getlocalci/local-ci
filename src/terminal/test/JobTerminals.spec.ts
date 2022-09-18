import AppTestHarness from 'test-tool/helpers/AppTestHarness';
import FakeEditorGateway from 'gateway/FakeEditorGateway';
import JobTerminals from 'terminal/JobTerminals';

let editorGateway: FakeEditorGateway;
let jobTerminals: JobTerminals;
let testHarness: AppTestHarness;

describe('JobTerminals', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    jobTerminals = testHarness.container.get(JobTerminals);
    editorGateway = testHarness.editorGateway;
  });

  test('terminal is not disposed', async () => {
    const jobName = 'build';
    const disposeSpy = jest.fn();
    editorGateway.editor.window.terminals = [
      {
        name: `Terminal unrelated to this extension   `,
        dispose: disposeSpy,
      },
    ];

    jobTerminals.dispose(jobName);
    expect(disposeSpy).not.toHaveBeenCalled();
  });

  test('terminal is disposed', async () => {
    const jobName = 'build';
    const disposeSpy = jest.fn();
    editorGateway.editor.window.terminals = [
      {
        name: `Local CI ${jobName}`,
        dispose: disposeSpy,
      },
    ];

    jobTerminals.dispose(jobName);
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });
});
