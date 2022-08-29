import * as assert from 'assert';
import getLocalVolumePath from 'containerization/getLocalVolumePath';

suite('getLocalVolumePath', () => {
  test('With empty string argument', () => {
    assert.strictEqual(getLocalVolumePath(''), '/tmp/local-ci/unknown/volume');
  });

  test('With a path as an argument', () => {
    assert.strictEqual(
      getLocalVolumePath('/home/baz/example/.circleci/config.yml'),
      '/tmp/local-ci/example/volume'
    );
  });
});
