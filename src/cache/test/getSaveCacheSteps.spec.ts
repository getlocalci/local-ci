import configWithCache from 'test-tool/fixture/with-cache.yml';
import getConfig from 'config/getConfig';
import getSaveCacheSteps from 'cache/getSaveCacheSteps';

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
