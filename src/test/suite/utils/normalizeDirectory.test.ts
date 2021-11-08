import * as assert from 'assert';
import normalizeDirectory from '../../../utils/normalizeDirectory';

suite('convertHomeDirToAbsolute', () => {
  test('No home directory', () => {
    assert.strictEqual(normalizeDirectory('/foo/baz', '/root', {}), '/foo/baz');
  });

  test('With home directory', () => {
    assert.strictEqual(
      normalizeDirectory('~/foo/baz', '/home/user', {}),
      '/home/user/foo/baz'
    );
  });

  test('With dot and no working_directory', () => {
    assert.strictEqual(
      normalizeDirectory('.', '/home/user', {}),
      '/home/user/project'
    );
  });

  test('With dot and working_directory', () => {
    assert.strictEqual(
      normalizeDirectory('.', '/home/user', {
        working_directory: '/root/project', // eslint-disable-line @typescript-eslint/naming-convention
      }),
      '/root/project'
    );
  });
});
