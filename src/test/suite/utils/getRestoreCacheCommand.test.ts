import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getRestoreCacheCommand from '../../../utils/getRestoreCacheCommand';

mocha.afterEach(() => {
  sinon.restore();
});

function normalize(text: string | undefined): string {
  return String(text).replace(/\s+/g, ' ').trim();
}

suite('getRestoreCacheCommand', () => {
  test('simple key property', () => {
    assert.strictEqual(
      normalize(
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
        )
      ),
      normalize(
        `restore_from_directories=("/tmp/local-ci/v2-deps-$( shasum "package-lock.json" | awk '{print $1}' )*/.npm");
        for directory_candidate in $restore_from_directories; do
          if [ $(ls -ard $directory_candidate 2>/dev/null) ]; then
            verified_directory=$(ls -ard $directory_candidate | tail -n1) echo "Restoring cached directory $verified_directory";
            cp -rn $verified_directory ~ || cp -ru $verified_directory ~;
            break;
          fi
        done;
        restore_from_directories=("/tmp/local-ci/v2-deps-$( shasum "package-lock.json" | awk '{print $1}' )*/.cache");
        for directory_candidate in $restore_from_directories; do
          if [ $(ls -ard $directory_candidate 2>/dev/null) ]; then
            verified_directory=$(ls -ard $directory_candidate | tail -n1)
            echo "Restoring cached directory $verified_directory";
            cp -rn $verified_directory ~ || cp -ru $verified_directory ~;
            break;
          fi
        done;`
      )
    );
  });

  test('keys property with multiple keys', () => {
    assert.strictEqual(
      normalize(
        getRestoreCacheCommand(
          {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            restore_cache: {
              keys: ['v2-deps-{{ checksum "package-lock.json" }}', 'v2-deps'],
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
        )
      ),
      normalize(
        `restore_from_directories=("/tmp/local-ci/v2-deps-$( shasum "package-lock.json" | awk '{print $1}' )*/.npm" "/tmp/local-ci/v2-deps*/.npm");
        for directory_candidate in $restore_from_directories; do
          if [ $(ls -ard $directory_candidate 2>/dev/null) ]; then
            verified_directory=$(ls -ard $directory_candidate | tail -n1)
            echo "Restoring cached directory $verified_directory";
            cp -rn $verified_directory ~ || cp -ru $verified_directory ~;
            break;
          fi
        done;
        restore_from_directories=("/tmp/local-ci/v2-deps-$( shasum "package-lock.json" | awk '{print $1}' )*/.cache" "/tmp/local-ci/v2-deps*/.cache");
        for directory_candidate in $restore_from_directories; do
          if [ $(ls -ard $directory_candidate 2>/dev/null) ]; then
            verified_directory=$(ls -ard $directory_candidate | tail -n1)
            echo "Restoring cached directory $verified_directory";
            cp -rn $verified_directory ~ || cp -ru $verified_directory ~;
            break;
          fi
        done;`
      )
    );
  });
});
