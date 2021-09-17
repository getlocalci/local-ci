import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import isDockerRunning from '../../../utils/isDockerRunning';

mocha.afterEach(() => {
  sinon.restore();
});

suite('isDockerRunning', () => {
  test('Is not running', () => {
    sinon
      .mock(cp)
      .expects('spawnSync')
      .once()
      .returns({ stderr: 'Cannot connect to the Docker daemon' });
    assert.strictEqual(isDockerRunning(), false);
  });

  test('Is running', () => {
    sinon.mock(cp).expects('spawnSync').once().returns({ stderr: '' });
    assert.strictEqual(isDockerRunning(), true);
  });
});
