import getConfig from 'config/getConfig';
import getJobs from 'job/getJobs';
import configWithCache from 'test-tools/fixture/with-cache.yml';

describe('getJobs', () => {
  test('single job', () => {
    expect(
      getJobs({
        jobs: {},
        workflows: {
          'test-deploy': {
            jobs: [{ test: {} }],
          },
        },
      }).size
    ).toEqual(1);
  });

  test('multiple jobs', () => {
    expect(
      getJobs({
        jobs: { lint: {}, test: {}, deploy: {} },
        workflows: {
          'test-deploy': {
            jobs: [
              { lint: { docker: [{ image: 'cimg/node:16.8.0' }] } },
              { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
              {
                deploy: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] },
              },
            ],
          },
        },
      }).size
    ).toEqual(3);
  });

  test('multiple jobs from fixture', () => {
    expect(getJobs(getConfig(configWithCache)).size).toEqual(8);
  });
});
