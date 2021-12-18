import * as assert from 'assert';
import { normalize } from '../../helpers';
import getAttachWorkspaceCommand from '../../../utils/getAttachWorkspaceCommand';

suite('getAttachWorkspaceCommand', () => {
  test('No attach_workspace', () => {
    assert.strictEqual(getAttachWorkspaceCommand({}), '');
  });

  test('With attach_workspace', () => {
    assert.strictEqual(
      normalize(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        getAttachWorkspaceCommand({ attach_workspace: { at: '/foo/baz' } })
      ),
      normalize(
        `if [ ! -d /tmp/local-ci ]; then
          echo "Error: tried to attach_workspace to /tmp/local-ci, but it's not a directory. It might require a job to run before it."
        elif [ ! "$(ls -A /tmp/local-ci)" ]; then
          echo "Error: tried to attach_workspace to /tmp/local-ci, but it's empty. It might require a job to run before it."
        else
          cp -rn /tmp/local-ci/. /foo/baz || cp -ru /tmp/local-ci/. /foo/baz
        fi`
      )
    );
  });
});
