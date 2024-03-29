import getLogFilePath from 'log/getLogFilePath';

describe('getLogFilePath', () => {
  test('empty path to config file', () => {
    expect(
      getLogFilePath('', 'test-lint').startsWith(
        '/tmp/local-ci/logs/test-lint/'
      )
    );
  });

  test('with path to config file', () => {
    expect(
      getLogFilePath('your-repo/.circleci/config.yml', 'test-lint').startsWith(
        '/tmp/local-ci/your-repo/logs/test-lint/'
      )
    );
  });
});
