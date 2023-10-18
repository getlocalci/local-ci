import getContainer from 'test-tool/TestRoot';

describe('JobTerminals', () => {
  test('terminal is not disposed', async () => {
    const { editorGateway, jobTerminals } = getContainer();
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
    const { editorGateway, jobTerminals } = getContainer();
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
