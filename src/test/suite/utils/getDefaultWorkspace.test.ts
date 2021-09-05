import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getDefaultWorkspace from '../../../utils/getDefaultWorkspace';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getDefaultWorkspace', () => {
  test('Without an image name', () => {
    assert.strictEqual(getDefaultWorkspace(''), '/home/circleci/project');
  });

  test('With an image name', () => {
    sinon.mock(cp).expects('spawnSync').twice().returns({ stdout: 'somename' });
    assert.strictEqual(
      getDefaultWorkspace('something'),
      '/home/somename/project'
    );
  });
});
