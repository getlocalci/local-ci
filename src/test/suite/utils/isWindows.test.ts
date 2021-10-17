import * as assert from 'assert';
import * as mocha from 'mocha';
import * as os from 'os';
import * as sinon from 'sinon';
import isWindows from '../../../utils/isWindows';

mocha.afterEach(() => {
  sinon.restore();
});

suite('isWindows', () => {
  test('windows', async () => {
    sinon.mock(os).expects('type').once().returns('Windows_NT');
    assert.strictEqual(isWindows(), true);
  });

  test('mac', async () => {
    sinon.mock(os).expects('type').once().returns('Darwin');
    assert.strictEqual(isWindows(), false);
  });

  test('linux', async () => {
    sinon.mock(os).expects('type').once().returns('Linux');
    assert.strictEqual(isWindows(), false);
  });
});
