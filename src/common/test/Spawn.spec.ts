import Spawn from 'common/Spawn';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import FakeEditorGateway from 'gateway/FakeEditorGateway';
import FakeOsGateway from 'gateway/FakeOsGateway';

let testHarness: AppTestHarness;
let spawn: Spawn;
let editorGateway: FakeEditorGateway;
let osGateway: FakeOsGateway;

describe('Spawn', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    editorGateway = testHarness.editorGateway;

    osGateway = testHarness.osGateway;
    spawn = testHarness.container.get(Spawn);
  });

  test('has working directory', () => {
    osGateway.os.platform = () => 'darwin';
    const path = 'example';
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
