import * as assert from 'assert';
import normalizeDirectory from '../../../utils/normalizeDirectory';

suite('convertHomeDirToAbsolute', () => {
  test('No home directory', () => {
    assert.strictEqual(
      normalizeDirectory('/foo/baz', '/root', undefined),
      '/foo/baz'
    );
  });

  test('With home directory', () => {
    assert.strictEqual(
      normalizeDirectory('~/foo/baz', '/home/project', undefined),
      '/home/project/foo/baz'
    );
  });
});
