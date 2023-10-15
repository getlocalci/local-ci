import EditorGateway from 'gateway/EditorGateway';
import JobTerminals from 'terminal/JobTerminals';
import getContainer from 'common/TestAppRoot';

let editorGateway: EditorGateway;
let jobTerminals: JobTerminals;

describe('JobTerminals', () => {
  beforeEach(() => {
    const container = getContainer();
    jobTerminals = container.jobTerminals;
    editorGateway = container.editorGateway;
  });

  test('terminal is not disposed', async () => {
    const jobName = 'build';
    const disposeSpy = jest.fn();
    // @ts-expect-error read-only property.
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
    // @ts-expect-error read-only property.
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
