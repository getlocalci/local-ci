import getContainer from 'test-tool/TestRoot';

describe('Spawn', () => {
  test('has working directory', () => {
    const { editorGateway, osGateway, spawn } = getContainer();
    osGateway.os.platform = () => 'darwin';
    const path = 'example';
    // @ts-expect-error read-only property.
    editorGateway.editor.workspace.workspaceFolders = [
      {
        uri: { path },
      },
    ];

    expect(spawn.getOptions().cwd).toEqual(path);
  });

  test('has bin directory', () => {
    const { osGateway, spawn } = getContainer();
    osGateway.os.platform = () => 'darwin';
    expect(spawn.getOptions().env.PATH.includes('/usr/local/bin'));
  });

  test('with cwd argument', () => {
    const { spawn } = getContainer();

    expect(spawn.getOptions('/foo/baz').cwd).toEqual('/foo/baz');
  });
});
