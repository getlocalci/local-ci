import getConfig from 'config/getConfig';
import getSaveCacheSteps from 'cache/getSaveCacheSteps';
import configWithCache from 'test-tools/fixture/with-cache.yml';

describe('getSaveCacheSteps', () => {
  test('with 2 save_cache values', () => {
    expect(getSaveCacheSteps(getConfig(configWithCache))).toEqual([
      {
        paths: ['~/.npm', '~/.cache'],
        key: 'v2-deps-{{ checksum "package-lock.json" }}',
      },
      {
        paths: ['node_modules'],
        key: 'node-modules-{{ checksum "package-lock.json" }}',
      },
    ]);
  });
});
