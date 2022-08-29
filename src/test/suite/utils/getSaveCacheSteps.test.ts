import * as assert from 'assert';
import { getTestFilePath } from 'test/helpers/';
import getConfigFromPath from 'utils/config/getConfigFromPath';
import getSaveCacheSteps from 'utils/cache/getSaveCacheSteps';

suite('getSaveCacheSteps', () => {
  test('with 2 save_cache values', () => {
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
