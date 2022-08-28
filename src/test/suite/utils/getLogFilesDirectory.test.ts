import * as assert from 'assert';
import getLogFilesDirectory from '../../../utils/log/getLogFilesDirectory';

suite('getLogFilePath', () => {
  test('with path to config file', () => {
    assert.strictEqual(
      getLogFilesDirectory('baz-repo/.circleci/config.yml', 'test-lint'),
      '/tmp/local-ci/baz-repo/logs/test-lint'
    );
  });
});
