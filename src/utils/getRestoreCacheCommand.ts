import * as path from 'path';
import convertToBash from './convertToBash';
import { CONTAINER_STORAGE_DIRECTORY } from '../constants';

export default function getRestoreCacheCommand(
  restoreCacheStep: FullStep,
  saveCacheSteps: (SaveCache | undefined)[]
): string | undefined {
  const originalSaveCacheStep = saveCacheSteps.find(
    (saveCacheStep) =>
      (!!restoreCacheStep?.restore_cache?.key &&
        saveCacheStep?.key.includes(restoreCacheStep?.restore_cache?.key)) ||
      restoreCacheStep?.restore_cache?.keys?.some((restoreCacheKey) =>
        saveCacheStep?.key.includes(restoreCacheKey)
      )
  );

  if (!originalSaveCacheStep) {
    return `echo "No save_cache directory found, so nothing to restore"`;
  }

  return originalSaveCacheStep?.paths.reduce((accumulator, saveCachePath) => {
    const dirname = path.dirname(saveCachePath);
    const restoreCacheKeys = restoreCacheStep?.restore_cache?.keys ?? [
      restoreCacheStep?.restore_cache?.key ?? '',
    ];

    return `${accumulator}restore_from_directories=(${restoreCacheKeys
      ?.map(
        (restoreCacheKey) =>
          `"${path.join(
            CONTAINER_STORAGE_DIRECTORY,
            convertToBash(restoreCacheKey) + '*', // The * is to support cascading fallback: https://circleci.com/docs/2.0/caching/#example-caching-configuration
            path.basename(saveCachePath)
          )}"`
      )
      .join(' ')})
    for directory_candidate in $restore_from_directories
      do
      if [ $(ls -ard $directory_candidate 2>/dev/null) ]
        then
        verified_directory=$(ls -ard $directory_candidate | tail -n1)
        echo "Restoring cached directory $verified_directory";
        cp -rn $verified_directory ${dirname} || cp -ru $verified_directory ${dirname};
        break;
      fi
    done;\n`;
  }, '');
}
