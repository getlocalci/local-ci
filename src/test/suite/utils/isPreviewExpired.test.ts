import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import isPreviewExpired from '../../../utils/isPreviewExpired';

mocha.afterEach(() => {
  sinon.restore();
});

suite('isPreviewExpired', () => {
  test('preview just began', () => {
    assert.strictEqual(isPreviewExpired(new Date().getTime()), false);
  });

  test('preview began 2 days and 1 millisecond ago', () => {
    assert.strictEqual(
      isPreviewExpired(new Date().getTime() - 172800001),
      true
    );
  });

  test('preview began a week ago', () => {
    assert.strictEqual(
      isPreviewExpired(new Date().getTime() - 604800000),
      true
    );
  });
});
