import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getProjectDirectory from '../../../utils/getProjectDirectory';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getProjectDirectory', () => {
  test('No image id', () => {
    sinon.mock(cp).expects('spawnSync').once().returns({
      stdout: '/root',
    });
    assert.strictEqual(getProjectDirectory(''), '/home/circleci/project');
  });

  test('With image id', () => {
    sinon.mock(cp).expects('spawnSync').once().returns({
      stdout: '/root',
    });

    assert.strictEqual(getProjectDirectory('98765'), '/root/project');
  });
});
