import * as assert from 'assert';
import { getTestFilePath } from '../../helpers';
import getConfigFromPath from '../../../utils/getConfigFromPath';
import getSaveCacheSteps from '../../../utils/getSaveCacheSteps';

suite('getSaveCacheSteps', () => {
  test('With 2 save_cache values', () => {
    assert.deepStrictEqual(
      getSaveCacheSteps(
        getConfigFromPath(getTestFilePath('fixture', 'with-cache.yml'))
      ),
      [
        {
          paths: ['~/.npm', '~/.cache'],
          key: 'v2-deps-{{ checksum "package-lock.json" }}',
        },
        {
          paths: ['node_modules'],
          key: 'node-modules-{{ checksum "package-lock.json" }}',
        },
      ]
    );
  });
});
