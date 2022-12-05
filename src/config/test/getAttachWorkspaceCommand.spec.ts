import getAttachWorkspaceCommand from 'config/getAttachWorkspaceCommand';
import normalize from 'test-tool/helper/normalize';

describe('getAttachWorkspaceCommand', () => {
  test('no attach_workspace', () => {
    expect(getAttachWorkspaceCommand({})).toEqual('');
  });

  test('with attach_workspace', () => {
    expect(
      normalize(
        getAttachWorkspaceCommand({ attach_workspace: { at: '/foo/baz' } })
      )
    ).toEqual(
      normalize(
        `if [ ! -d /tmp/local-ci ]
          then
          echo "Warning: tried to attach_workspace to /tmp/local-ci, but it's not a directory. It might require a job to run before it."
        elif [ ! "$(ls -A /tmp/local-ci)" ]
          then
          echo "Warning: tried to attach_workspace to /tmp/local-ci, but it's empty. It might require a job to run before it."
        else
          echo "Attaching /tmp/local-ci/."
          cp -rn /tmp/local-ci/. /foo/baz || cp -ru /tmp/local-ci/. /foo/baz
        fi`
      )
    );
  });
});
