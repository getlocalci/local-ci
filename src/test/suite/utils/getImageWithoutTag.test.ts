import * as assert from 'assert';
import getImageWithoutTag from '../../../utils/getImageWithoutTag';

suite('getImageWithoutTag', () => {
  test('Image with no tag', () => {
    const imageWithNoTag = 'example-image';
    assert.strictEqual(getImageWithoutTag(imageWithNoTag), imageWithNoTag);
  });

  test('Image with tag', () => {
    assert.strictEqual(getImageWithoutTag('image-name:tag'), 'image-name');
  });

  test('Image with tag and spaces', () => {
    assert.strictEqual(getImageWithoutTag(' image-name:tag '), 'image-name');
  });
});
