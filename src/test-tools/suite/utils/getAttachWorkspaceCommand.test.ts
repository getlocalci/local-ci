import * as assert from 'assert';
import { normalize } from 'test-tools/helpers';
import getAttachWorkspaceCommand from 'config/getAttachWorkspaceCommand';

suite('getAttachWorkspaceCommand', () => {
  test('no attach_workspace', () => {
    assert.strictEqual(getAttachWorkspaceCommand({}), '');
  });

  test('with attach_workspace', () => {
    assert.strictEqual(
      normalize(
        getAttachWorkspaceCommand({ attach_workspace: { at: '/foo/baz' } })
      ),
      normalize(
        `if [ ! -d /tmp/local-ci ]
          then
          echo "Warning: tried to attach_workspace to /tmp/local-ci, but it's not a directory. It might require a job to run before it."
        elif [ ! "$(ls -A /tmp/local-ci)" ]
          then
          echo "Warning: tried to attach_workspace to /tmp/local-ci, but it's empty. It might require a job to run before it."
        else
          cp -rn /tmp/local-ci/. /foo/baz || cp -ru /tmp/local-ci/. /foo/baz
        fi`
      )
    );
  });
});
