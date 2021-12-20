import * as assert from 'assert';
import * as yaml from 'js-yaml';
import getJobs from '../../../utils/getJobs';

suite('getJobs', () => {
  test('Single job', () => {
    assert.strictEqual(
      getJobs(
        yaml.dump({
          jobs: {},
          workflows: {
            'test-deploy': {
              jobs: [{ test: {} }],
              workflows: {
                'test-deploy': {
                  jobs: [
                    {
                      test: {
                        docker: [{ image: 'cimg/node:16.8.0-browsers' }],
                      },
                    },
                  ],
                },
              },
            },
          },
        })
      ).size,
      1
    );
  });

  test('Multiple jobs', () => {
    assert.strictEqual(
      getJobs(
        yaml.dump({
          jobs: [{ lint: {}, test: {}, deploy: {} }],
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
        })
      ).size,
      3
    );
  });
});
