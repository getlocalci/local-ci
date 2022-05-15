import * as assert from 'assert';
import getImageFromJob from '../../../utils/getImageFromJob';

suite('getImageFromJob', () => {
  test('No docker value', () => {
    assert.deepStrictEqual(
      getImageFromJob({ working_directory: 'foo/baz' }),
      ''
    );
  });

  test('Empty docker array', () => {
    assert.deepStrictEqual(getImageFromJob({ docker: [] }), '');
  });

  test('With docker image', () => {
    assert.deepStrictEqual(
      getImageFromJob({ docker: [{ image: 'foo-image' }] }),
      'foo-image'
    );
  });
});
