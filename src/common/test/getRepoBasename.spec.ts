import getRepoBasename from 'common/getRepoBasename';

describe('getRepoBasename', () => {
  test('Simple basename', () => {
    expect(getRepoBasename('home/baz/your-repo/.circleci/config.yml')).toEqual(
      'your-repo'
    );
  });
});
