import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import addTrailingSlash from '../../../utils/addTrailingSlash';

mocha.afterEach(() => {
  sinon.restore();
});

suite('addTrailingSlash', () => {
  test('Empty string', () => {
    assert.strictEqual(addTrailingSlash(''), '');
  });

  test('No trailing slash', () => {
    assert.strictEqual(addTrailingSlash('/foo/baz'), '/foo/baz/');
  });

  test('With trailing slash', () => {
    assert.strictEqual(addTrailingSlash('/foo/baz/'), '/foo/baz/');
  });

  test('With trailing slash and extra space', () => {
    assert.strictEqual(addTrailingSlash('/foo/baz/ '), '/foo/baz/');
  });
});
