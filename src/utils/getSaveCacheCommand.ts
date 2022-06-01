import * as path from 'path';
import convertToBash from './convertToBash';
import {
  CONTAINER_STORAGE_DIRECTORY,
  ENSURE_VOLUME_IS_WRITABLE,
} from '../constants';

export default function getSaveCacheCommand(
  step: FullStep
): string | undefined {
  return step?.save_cache?.paths.reduce((accumulator, directory) => {
    const destination = path.join(
      CONTAINER_STORAGE_DIRECTORY,
      convertToBash(step?.save_cache?.key ?? '')
    );
    const destinationWhenCopied = path.join(
      destination,
      path.basename(directory)
    );

    return `${accumulator} if [ -d ${destinationWhenCopied} ]
      then
      echo "${directory} is already cached, skipping"
    elif [ ! -d ${directory} ]
      then
      echo "${directory} does not exist, skipping caching"
    else
      echo "Saving ${directory} to the cache"
      mkdir -p ${destination}
      cp -rn ${directory} ${destinationWhenCopied} || cp -ru ${directory} ${destinationWhenCopied}
    fi \n`;
  }, ENSURE_VOLUME_IS_WRITABLE);
}
