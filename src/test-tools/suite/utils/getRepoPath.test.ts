import * as assert from 'assert';
import getRepoPath from 'common/getRepoPath';

suite('getRepoPath', () => {
  test('Simple path', () => {
    assert.strictEqual(
      getRepoPath('/home/example/your-repo/.circleci/config.yml'),
      '/home/example/your-repo'
    );
  });
});
