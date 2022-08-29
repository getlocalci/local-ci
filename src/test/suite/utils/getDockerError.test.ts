import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getDockerError from 'utils/containerization/getDockerError';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getDockerError', () => {
  test('no error', () => {
    sinon.mock(cp).expects('execSync').once();
    assert.strictEqual(getDockerError(), '');
  });

  test('with error', () => {
    const message = 'Cannot connect to the Docker daemon';
    sinon.mock(cp).expects('execSync').once().throws({ message });

    assert.strictEqual(getDockerError(), message);
  });
});
