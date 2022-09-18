import getCheckoutJobs from 'job/getCheckoutJobs';

describe('getCheckoutJobs', () => {
  test('no config file', () => {
    expect(getCheckoutJobs(undefined)).toEqual([]);
  });

  test('no checkout job', () => {
    expect(
      getCheckoutJobs({
        jobs: { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
        workflows: {},
      })
    ).toEqual([]);
  });

  test('With string checkout job', () => {
    expect(
      getCheckoutJobs({
        jobs: {
          test: {
            docker: [{ image: 'cimg/node:16.8.0-browsers' }],
            steps: ['node/install-npm', 'checkout'],
          },
        },
        workflows: {},
      })
    ).toEqual(['test']);
  });
});
