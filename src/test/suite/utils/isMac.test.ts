import * as assert from 'assert';
import * as mocha from 'mocha';
import * as os from 'os';
import * as sinon from 'sinon';
import isMac from '../../../utils/common/isMac';

mocha.afterEach(() => {
  sinon.restore();
});

suite('isMac', () => {
  test('mac', async () => {
    sinon.mock(os).expects('type').once().returns('Darwin');
    assert.strictEqual(isMac(), true);
  });

  test('linux', async () => {
    sinon.mock(os).expects('type').once().returns('Linux');
    assert.strictEqual(isMac(), false);
  });

  test('windows', async () => {
    sinon.mock(os).expects('type').once().returns('Windows_NT');
    assert.strictEqual(isMac(), false);
  });
});
