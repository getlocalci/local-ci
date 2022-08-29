import * as assert from 'assert';
import getHash from 'license/getHash';

suite('getHash', () => {
  test('empty string', () => {
    assert.strictEqual(
      getHash(''),
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });

  test('possible machineId 1', () => {
    assert.strictEqual(
      getHash(
        'a923bcf3da6acff9c9bf4f129135ffd56adbfa294aeb8117c7264164c1a9382ca'
      ),
      'ea5320a945bfe117f3d9ee12268734180b697913fb7ff498549a5bb201255b09'
    );
  });

  test('possible machineId 2', () => {
    assert.strictEqual(
      getHash(
        '52ab60b09f4e8fae2bcb8ac38871cfa8613ee4a1d566dcec5659e320148dc366e'
      ),
      'f600f144c3c96701f3c34ddd9fb65089af27fb8264fcba12f40af8d6cbbddeeb'
    );
  });
});
