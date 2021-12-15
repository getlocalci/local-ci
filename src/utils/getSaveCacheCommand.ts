import * as path from 'path';
import convertToBash from './convertToBash';
import { CONTAINER_STORAGE_DIRECTORY } from '../constants';

export default function getSaveCacheCommand(
  step: FullStep
): string | undefined {
  return step?.save_cache?.paths.reduce((accumulator, directory) => {
    const destination = path.join(
      CONTAINER_STORAGE_DIRECTORY,
      convertToBash(step?.save_cache?.key ?? '')
    );

    return `${accumulator} if [ -d ${destination} ]; then echo "Cached file already exists, skipping"; elif [ ! -d ${directory} ]; then echo "Directory to cache does not exist, skipping"; else cp -rn ${directory} ${destination} || cp -ru ${directory} ${destination}; fi \n`;
  }, '');
}
