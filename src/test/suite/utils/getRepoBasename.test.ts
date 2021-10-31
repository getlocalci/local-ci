import * as assert from 'assert';
import getRepoBasename from '../../../utils/getRepoBasename';

suite('getRepoBasename', () => {
  test('Simple basename', () => {
    assert.strictEqual(
      getRepoBasename('home/baz/your-repo/.circleci/config.yml'),
      'your-repo'
    );
  });
});
