import * as assert from 'assert';
import * as fs from 'fs';
import getConfig from 'config/getConfig';
import getAllJobs from 'job/getJobs';
import { getTestFilePath } from 'test-tools/helpers';

suite('getAllJobs', () => {
  test('jobs from fixture', () => {
    assert.strictEqual(
      getAllJobs(
        getConfig(
          fs.readFileSync(getTestFilePath('fixture', 'with-cache.yml'), 'utf8')
        )
      ).size,
      8
    );
  });
});
