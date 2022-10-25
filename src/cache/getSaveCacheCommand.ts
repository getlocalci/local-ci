import * as path from 'path';
import convertToBash from './convertToBash';
import { CONTAINER_STORAGE_DIRECTORY } from 'constant';

export default function getSaveCacheCommand(step: FullStep): string {
  return (
    step?.save_cache?.paths.reduce((accumulator, directory) => {
      const destination = path.join(
        CONTAINER_STORAGE_DIRECTORY,
        convertToBash(step?.save_cache?.key ?? '')
      );
      const destinationWhenCopied = path.join(
        destination,
        path.basename(directory)
      );

      // BusyBox doesn't allow cp -n.
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
    }, '') ?? ''
  );
}
