import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getRestoreCacheCommand from '../../../utils/getRestoreCacheCommand';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getRestoreCacheCommand', () => {
  test('Simple cache', () => {
    assert.strictEqual(
      getRestoreCacheCommand(
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          restore_cache: {
            key: 'v2-deps-{{ checksum "package-lock.json" }}',
          },
        },
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
      ),
      `if [ -d /tmp/local-ci/v2-deps-$( shasum "package-lock.json" | awk '{print $1}' )/.npm ]; then cp -rn /tmp/local-ci/v2-deps-$( shasum "package-lock.json" | awk '{print $1}' )/.npm ~ || cp -ru /tmp/local-ci/v2-deps-$( shasum "package-lock.json" | awk '{print $1}' )/.npm ~; fi \nif [ -d /tmp/local-ci/v2-deps-$( shasum "package-lock.json" | awk '{print $1}' )/.cache ]; then cp -rn /tmp/local-ci/v2-deps-$( shasum "package-lock.json" | awk '{print $1}' )/.cache ~ || cp -ru /tmp/local-ci/v2-deps-$( shasum "package-lock.json" | awk '{print $1}' )/.cache ~; fi \n`
    );
  });
});
