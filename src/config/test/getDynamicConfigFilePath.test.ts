import getDynamicConfigPath from 'config/getDynamicConfigPath';

describe('getDynamicConfigFilePath', () => {
  test('with empty string argument', () => {
    expect(getDynamicConfigPath('')).toEqual(
      '/tmp/local-ci/unknown/volume/dynamic-config.yml'
    );
  });

  test('with path as argument', () => {
    expect(getDynamicConfigPath('/home/foo/baz/.circleci/config.yml')).toEqual(
      '/tmp/local-ci/baz/volume/dynamic-config.yml'
    );
  });
});
