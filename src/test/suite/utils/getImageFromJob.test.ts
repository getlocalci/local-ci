import * as assert from 'assert';
import getImageFromJob from '../../../utils/getImageFromJob';

suite('getImageFromJob', () => {
  test('No docker value', () => {
    assert.deepStrictEqual(
      getImageFromJob({ working_directory: 'foo/baz' }), // eslint-disable-line @typescript-eslint/naming-convention
      ''
    );
  });

  test('Empty docker array', () => {
    assert.deepStrictEqual(
      getImageFromJob({ docker: [] }), // eslint-disable-line @typescript-eslint/naming-convention
      ''
    );
  });

  test('With docker image', () => {
    assert.deepStrictEqual(
      getImageFromJob({ docker: [{ image: 'foo-image' }] }), // eslint-disable-line @typescript-eslint/naming-convention
      'foo-image'
    );
  });
});
