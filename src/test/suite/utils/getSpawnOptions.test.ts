import * as assert from 'assert';
import * as mocha from 'mocha';
import * as os from 'os';
import * as sinon from 'sinon';
import getSpawnOptions from '../../../utils/getSpawnOptions';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getSpawnOptions', () => {
  sinon.mock(os).expects('platform').twice().returns('darwin');

  test('Has working directory', () => {
    assert.ok(getSpawnOptions().cwd);
  });

  test('Has bin directory', () => {
    assert.ok(getSpawnOptions().env.PATH.includes('/usr/local/bin'));
  });
});
