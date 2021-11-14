import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getAttachWorkspaceCommand from '../../../utils/getAttachWorkspaceCommand';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getAttachWorkspaceCommand', () => {
  test('No attach_workspace', () => {
    assert.strictEqual(getAttachWorkspaceCommand({}), '');
  });

  test('With attach_workspace', () => {
    assert.strictEqual(
      getAttachWorkspaceCommand({ attach_workspace: { at: '/foo/baz' } }), // eslint-disable-line @typescript-eslint/naming-convention
      'cp -rn /tmp/local-ci/* /foo/baz || cp -ru /tmp/local-ci/* /foo/baz'
    );
  });
});
