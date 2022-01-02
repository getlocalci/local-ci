import * as assert from 'assert';
import getDynamicConfigFilePath from '../../../utils/getDynamicConfigFilePath';

suite('getDynamicConfigFilePath', () => {
  test('With empty string argument', () => {
    assert.strictEqual(
      getDynamicConfigFilePath(''),
      '/tmp/local-ci/volume/unknown/config.yml'
    );
  });

  test('With path as argument', () => {
    assert.strictEqual(
      getDynamicConfigFilePath('/home/foo/baz/.circleci/config.yml'),
      '/tmp/local-ci/volume/baz/config.yml'
    );
  });
});
