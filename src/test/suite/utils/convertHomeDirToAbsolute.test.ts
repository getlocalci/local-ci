import * as assert from 'assert';
import convertHomeDirToAbsolute from '../../../utils/convertHomeDirToAbsolute';

suite('convertHomeDirToAbsolute', () => {
  test('No home directory', () => {
    assert.strictEqual(
      convertHomeDirToAbsolute('/foo/baz', '/home/project'),
      '/foo/baz'
    );
  });

  test('With home directory', () => {
    assert.strictEqual(
      convertHomeDirToAbsolute('~/foo/baz', '/home/project'),
      '/home/project/foo/baz'
    );
  });
});
