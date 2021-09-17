import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getDockerError from '../../../utils/getDockerError';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getDockerError', () => {
  test('No error', () => {
    sinon
      .mock(cp)
      .expects('spawnSync')
      .once()
      .returns({ stderr: 'Cannot connect to the Docker daemon' });
    assert.strictEqual(getDockerError(), 'Cannot connect to the Docker daemon');
  });

  test('With error', () => {
    sinon.mock(cp).expects('spawnSync').once().returns({ stderr: '' });
    assert.strictEqual(getDockerError(), '');
  });
});
