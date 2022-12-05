import getLocalVolumePath from 'containerization/getLocalVolumePath';

describe('getLocalVolumePath', () => {
  test('With empty string argument', () => {
    expect(getLocalVolumePath('')).toEqual('/tmp/local-ci/unknown/volume');
  });

  test('With a path as an argument', () => {
    expect(
      getLocalVolumePath('/home/baz/example/.circleci/config.yml')
    ).toEqual('/tmp/local-ci/example/volume');
  });
});
