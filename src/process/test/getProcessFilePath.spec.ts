import getProcessFilePath from '../getProcessFilePath';

describe('getProcessFilePath', () => {
  test('with a short path', () => {
    expect(getProcessFilePath('something/.circleci/config.yml')).toEqual(
      '/tmp/local-ci/something/process.yml'
    );
  });

  test('with a long path', () => {
    expect(
      getProcessFilePath('example/another/local-ci/.circleci/config.yml ')
    ).toEqual('/tmp/local-ci/local-ci/process.yml');
  });
});
