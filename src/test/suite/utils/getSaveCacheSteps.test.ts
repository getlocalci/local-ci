import * as path from 'path';
import * as assert from 'assert';
import getConfigFromPath from '../../../utils/getConfigFromPath';
import getSaveCacheSteps from '../../../utils/getSaveCacheSteps';

suite('getSaveCacheSteps', () => {
  test('With 1 save_cache', () => {
    const config = getConfigFromPath(
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'src',
        'test',
        'fixture',
        'config-with-cache.yml'
      )
    );
    assert.deepStrictEqual(getSaveCacheSteps(config), [
      {
        paths: ['~/.npm', '~/.cache'],
        key: 'v2-deps-{{ checksum "package-lock.json" }}',
      },
    ]);
  });
});
