import * as assert from 'assert';
import getDynamicConfigPath from 'config/getDynamicConfigPath';

suite('getDynamicConfigFilePath', () => {
  test('with empty string argument', () => {
    assert.strictEqual(
      getDynamicConfigPath(''),
      '/tmp/local-ci/unknown/volume/dynamic-config.yml'
    );
  });

  test('with path as argument', () => {
    assert.strictEqual(
      getDynamicConfigPath('/home/foo/baz/.circleci/config.yml'),
      '/tmp/local-ci/baz/volume/dynamic-config.yml'
    );
  });
});
