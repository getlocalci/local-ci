import * as assert from 'assert';
import * as fs from 'fs';
import getConfig from 'config/getConfig';
import getJobs from 'job/getJobs';
import { getTestFilePath } from 'test-tools/helpers';

suite('getJobs', () => {
  test('single job', () => {
    assert.strictEqual(
      getJobs({
        jobs: {},
        workflows: {
          'test-deploy': {
            jobs: [{ test: {} }],
          },
        },
      }).size,
      1
    );
  });

  test('multiple jobs', () => {
    assert.strictEqual(
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
      }).size,
      3
    );
  });

  test('multiple jobs from fixture', () => {
    assert.strictEqual(
      getJobs(
        getConfig(
          fs.readFileSync(getTestFilePath('fixture', 'with-cache.yml'), 'utf8')
        )
      ).size,
      8
    );
  });
});
