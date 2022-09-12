import FakeEditorGateway from 'gateway/FakeEditorGateway';
import JobTerminals from 'terminal/JobTerminals';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';

let testHarness: AppTestHarness;
let editorGateway: FakeEditorGateway;
let jobTerminals: JobTerminals;

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
