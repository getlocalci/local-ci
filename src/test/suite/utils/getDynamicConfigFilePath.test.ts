import * as assert from 'assert';
import getDynamicConfigPath from '../../../utils/getDynamicConfigPath';

suite('getDynamicConfigFilePath', () => {
  test('With empty string argument', () => {
    assert.strictEqual(
      getDynamicConfigPath(''),
      '/tmp/local-ci/unknown/volume/dynamic-config.yml'
    );
  });

  test('With path as argument', () => {
    assert.strictEqual(
      getDynamicConfigPath('/home/foo/baz/.circleci/config.yml'),
      '/tmp/local-ci/baz/volume/dynamic-config.yml'
    );
  });
});
