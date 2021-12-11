import * as path from 'path';
import convertToBash from './convertToBash';
import { CONTAINER_STORAGE_DIRECTORY } from '../constants';

// @todo: handle restore_cache having .keys.
export default function getRestoreCacheCommand(
  step: FullStep,
  saveCacheSteps: (SaveCache | undefined)[]
): string {
  const originalSaveCacheStep = saveCacheSteps.find(
    (saveCacheStep) => saveCacheStep?.key === step?.restore_cache?.key
  );

  if (!originalSaveCacheStep) {
    return '';
  }

  const cacheDirectory = path.join(
    CONTAINER_STORAGE_DIRECTORY,
    convertToBash(step?.restore_cache?.key ?? '')
  );

  return originalSaveCacheStep.paths.reduce((accumulator, saveCachePath) => {
    const basename = path.basename(saveCachePath);
    const fullCacheDirectory = path.join(cacheDirectory, basename);
    const dirname = path.dirname(saveCachePath);

    return `${accumulator}if [ -d ${fullCacheDirectory} ]; then cp -rn ${fullCacheDirectory} ${dirname} || cp -ru ${fullCacheDirectory} ${dirname}; fi \n`;
  }, '');
}
