import * as assert from 'assert';
import getImageWithoutTag from '../../../utils/getImageWithoutTag';

suite('getImageWithoutTag', () => {
  test('Image with no tag', () => {
    const imageWithNoTag = 'example-image';
    assert.strictEqual(imageWithNoTag, getImageWithoutTag(imageWithNoTag));
  });

  test('Image with tag', () => {
    assert.strictEqual('image-name', getImageWithoutTag('image-name:tag'));
  });

  test('Image with tag and spaces', () => {
    assert.strictEqual('image-name', getImageWithoutTag(' image-name:tag '));
  });
});
