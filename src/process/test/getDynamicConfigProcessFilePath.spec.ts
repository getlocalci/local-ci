import getDynamicConfigProcessFilePath from '../getDynamicConfigProcessFilePath';

describe('getDynamicConfigProcessFilePath', () => {
  test('with a short path', () => {
    expect(
      getDynamicConfigProcessFilePath('example/.circleci/config.yml')
    ).toEqual('/tmp/local-ci/example/dynamic-config-process.yml');
  });

  test('with a long path', () => {
    expect(
      getDynamicConfigProcessFilePath(
        'foo/baz/somthing/local-ci/.circleci/config.yml '
      )
    ).toEqual('/tmp/local-ci/local-ci/dynamic-config-process.yml');
  });
});
