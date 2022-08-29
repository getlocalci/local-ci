import getRestoreCacheCommand from 'cache/getRestoreCacheCommand';
import { normalize } from 'test/helpers';

describe('getRestoreCacheCommand', () => {
  test('simple key property', () => {
    expect(
      normalize(
        getRestoreCacheCommand(
          {
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
      )
    ).toEqual(
      normalize(
        `restore_from_directories=("/tmp/local-ci/v2-deps-$( if [ -f "package-lock.json" ]; then (shasum "package-lock.json" 2>/dev/null || sha256sum "package-lock.json" 2>/dev/null) | awk '{print $1}'; fi )*/.npm")
        for directory_candidate in $restore_from_directories
          do
          if [ "$(find $directory_candidate 2>/dev/null)" ]
            then
            verified_directory=$(find $directory_candidate | tail -n1) echo "Restoring cached directory $verified_directory";
            cp -rn $verified_directory ~ || cp -ru $verified_directory ~;
            break;
          fi
        done
        restore_from_directories=("/tmp/local-ci/v2-deps-$( if [ -f "package-lock.json" ]; then (shasum "package-lock.json" 2>/dev/null || sha256sum "package-lock.json" 2>/dev/null) | awk '{print $1}'; fi )*/.cache")
        for directory_candidate in $restore_from_directories
          do
          if [ "$(find $directory_candidate 2>/dev/null)" ]
            then
            verified_directory=$(find $directory_candidate | tail -n1)
            echo "Restoring cached directory $verified_directory";
            cp -rn $verified_directory ~ || cp -ru $verified_directory ~;
            break;
          fi
        done`
      )
    );
  });

  test('keys property with multiple keys', () => {
    expect(
      normalize(
        getRestoreCacheCommand(
          {
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
      )
    ).toEqual(
      normalize(
        `restore_from_directories=("/tmp/local-ci/v2-deps-$( if [ -f "package-lock.json" ]; then (shasum "package-lock.json" 2>/dev/null || sha256sum "package-lock.json" 2>/dev/null) | awk '{print $1}'; fi )*/.npm" "/tmp/local-ci/v2-deps*/.npm")
        for directory_candidate in $restore_from_directories
          do
          if [ "$(find $directory_candidate 2>/dev/null)" ]
            then
            verified_directory=$(find $directory_candidate | tail -n1)
            echo "Restoring cached directory $verified_directory";
            cp -rn $verified_directory ~ || cp -ru $verified_directory ~;
            break;
          fi
        done
        restore_from_directories=("/tmp/local-ci/v2-deps-$( if [ -f "package-lock.json" ]; then (shasum "package-lock.json" 2>/dev/null || sha256sum "package-lock.json" 2>/dev/null) | awk '{print $1}'; fi )*/.cache" "/tmp/local-ci/v2-deps*/.cache")
        for directory_candidate in $restore_from_directories
          do
          if [ "$(find $directory_candidate 2>/dev/null)" ]
          then
            verified_directory=$(find $directory_candidate | tail -n1)
            echo "Restoring cached directory $verified_directory";
            cp -rn $verified_directory ~ || cp -ru $verified_directory ~;
            break;
          fi
        done`
      )
    );
  });
});
