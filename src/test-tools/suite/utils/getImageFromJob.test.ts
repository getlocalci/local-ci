import * as assert from 'assert';
import getImageFromJob from 'containerization/getImageFromJob';

suite('getImageFromJob', () => {
  test('no docker value', () => {
    assert.deepStrictEqual(
      getImageFromJob({ working_directory: 'foo/baz' }),
      ''
    );
  });

  test('empty docker array', () => {
    assert.deepStrictEqual(getImageFromJob({ docker: [] }), '');
  });

  test('with docker image', () => {
    assert.deepStrictEqual(
      getImageFromJob({ docker: [{ image: 'foo-image' }] }),
      'foo-image'
    );
  });
});
