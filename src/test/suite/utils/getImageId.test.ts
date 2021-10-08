import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getImageId from '../../../utils/getImageId';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getImageId', () => {
  test('No image id', () => {
    sinon.mock(cp).expects('spawnSync').once().returns({});
    assert.strictEqual(getImageId('foo'), '');
  });

  test('Has image id', () => {
    sinon.mock(cp).expects('spawnSync').once().returns({
      stdout: '12345',
    });
    assert.strictEqual(getImageId('foo'), '12345');
  });

  test('Has image id wit extra whitespace', () => {
    sinon.mock(cp).expects('spawnSync').once().returns({
      stdout: `  12345\n`,
    });
    assert.strictEqual(getImageId('foo'), '12345');
  });
});
