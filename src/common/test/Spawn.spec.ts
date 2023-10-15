import EditorGateway from 'gateway/EditorGateway';
import OsGateway from 'gateway/OsGateway';
import Spawn from 'common/Spawn';
import getContainer from 'common/TestAppRoot';

let editorGateway: EditorGateway;
let osGateway: OsGateway;
let spawn: Spawn;

describe('Spawn', () => {
  beforeEach(() => {
    const container = getContainer();
    editorGateway = container.editorGateway;

    osGateway = container.osGateway;
    spawn = container.spawn;
  });

  test('has working directory', () => {
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
    osGateway.os.platform = () => 'darwin';
    expect(spawn.getOptions().env.PATH.includes('/usr/local/bin'));
  });

  test('with cwd argument', () => {
    expect(spawn.getOptions('/foo/baz').cwd).toEqual('/foo/baz');
  });
});
