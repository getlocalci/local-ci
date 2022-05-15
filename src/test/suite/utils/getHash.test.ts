import * as assert from 'assert';
import getHash from '../../../utils/getHash';

suite('getHash', () => {
  test('machineId format', () => {
    assert.strictEqual(
      getHash(
        'a923bcf3da6acff9c9bf4f129135ffd56adbfa294aeb8117c7264164c1a9382ca'
      ),
      'ea5320a945bfe117f3d9ee12268734180b697913fb7ff498549a5bb201255b09'
    );
  });

  test('empty string', () => {
    assert.strictEqual(
      getHash(''),
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });
});
