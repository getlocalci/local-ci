import * as assert from 'assert';
import getLocalVolumePath from '../../../utils/getLocalVolumePath';

suite('getLocalVolumePath', () => {
  test('With empty string argument', () => {
    assert.strictEqual(getLocalVolumePath(''), '/tmp/local-ci/volume/unknown');
  });

  test('With a path as an argument', () => {
    assert.strictEqual(
      getLocalVolumePath('/home/baz/example/.circleci/config.yml'),
      '/tmp/local-ci/volume/example'
    );
  });
});
