import getAllJobs from 'job/getJobs';
import getConfig from 'config/getConfig';
import withCacheFixture from 'test-tools/fixture/with-cache.yml';

describe('getAllJobs', () => {
  test('jobs from fixture', () => {
    expect(getAllJobs(getConfig(withCacheFixture)).size).toEqual(8);
  });
});
