import * as assert from 'assert';
import getLogFilePath from '../../../utils/getLogFilePath';

suite('getLogFilePath', () => {
  test('empty path to config file', () => {
    assert.ok(
      getLogFilePath('', 'test-lint').startsWith(
        '/tmp/local-ci/logs/test-lint/'
      )
    );
  });

  test('with path to config file', () => {
    assert.ok(
      getLogFilePath('your-repo/.circleci/config.yml', 'test-lint').startsWith(
        '/tmp/local-ci/your-repo/logs/test-lint/'
      )
    );
  });
});
