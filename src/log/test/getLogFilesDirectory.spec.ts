import getLogFilesDirectory from 'log/getLogFilesDirectory';

describe('getLogFilePath', () => {
  test('with path to config file', () => {
    expect(
      getLogFilesDirectory('baz-repo/.circleci/config.yml', 'test-lint')
    ).toEqual('/tmp/local-ci/baz-repo/logs/test-lint');
  });
});
