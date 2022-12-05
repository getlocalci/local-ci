import getRepoPath from 'common/getRepoPath';

describe('getRepoPath', () => {
  test('simple path', () => {
    expect(getRepoPath('/home/example/your-repo/.circleci/config.yml')).toEqual(
      '/home/example/your-repo'
    );
  });
});
