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
    const destinationWhenCopied = path.join(
      destination,
      path.basename(directory)
    );

    return `${accumulator}
    echo "key is ${step?.save_cache?.key}"
    echo "the key converted to bash is ${convertToBash(step?.save_cache?.key ?? '')}"
    echo "destinationWhenCopied is ${destinationWhenCopied}"
    echo "destination is ${destination}"
    echo "directory is ${directory}"
    echo "the basename of directory is ${path.basename(directory)}"
    if [ -d "${destinationWhenCopied}" ]
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
  }, '');
}
