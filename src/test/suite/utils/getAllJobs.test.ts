import * as assert from 'assert';
import * as fs from 'fs';
import getConfig from '../../../utils/getConfig';
import getAllJobs from '../../../utils/getJobs';
import { getTestFilePath } from '../../helpers';

suite('getAllJobs', () => {
  test('Jobs from fixture', () => {
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
