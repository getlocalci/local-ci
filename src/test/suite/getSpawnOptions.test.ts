import * as assert from 'assert';
import getSpawnOptions from '../../utils/getSpawnOptions';
import * as sinon from 'sinon';
import * as os from 'os';

sinon.mock(os).expects('platform').twice().returns('darwin');

suite('getSpawnOptions', () => {
  test('Has working directory', () => {
    assert.ok(getSpawnOptions().cwd.includes('local-ci'));
  });

  test('Has bin directory', () => {
    assert.ok(getSpawnOptions().env.PATH.includes('/usr/local/bin'));
  });
});
