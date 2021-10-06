import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getProjectDirectory from '../../../utils/getProjectDirectory';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getProjectDirectory', () => {
  test('Without an image name', () => {
    assert.strictEqual(getProjectDirectory(''), '/home/circleci/project');
  });

  test('With an image name', () => {
    sinon.mock(cp).expects('spawnSync').twice().returns({ stdout: 'somename' });
    assert.strictEqual(getProjectDirectory('something'), '/somename/project');
  });
});
