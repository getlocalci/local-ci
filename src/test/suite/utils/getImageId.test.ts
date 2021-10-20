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
    sinon.mock(cp).expects('spawnSync').atLeast(3).returns({});
    assert.strictEqual(getImageId('foo'), '');
  });

  test('Has image id', () => {
    sinon
      .mock(cp)
      .expects('spawnSync')
      .returns({
        stdout: { toString: () => '12345' },
      });
    assert.strictEqual(getImageId('foo'), '12345');
  });

  test('Has image id with extra whitespace', () => {
    sinon
      .mock(cp)
      .expects('spawnSync')
      .returns({
        stdout: { toString: () => `  12345\n` },
      });
    assert.strictEqual(getImageId('foo'), '12345');
  });
});
