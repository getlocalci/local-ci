import * as cp from 'child_process';
import getSpawnOptions from './getSpawnOptions';

export default function cleanUpCommittedImages(
  imagePattern: string,
  imageIdToExclude?: string
): void {
  cp.spawn(
    '/bin/sh',
    [
      '-c',
      `LOCAL_CI_IMAGES=$(docker images -q --filter reference="${imagePattern}")
      echo $LOCAL_CI_IMAGES | while read image; do
        if [[ ${imageIdToExclude} == $image ]]; then
          continue
        fi
        LOCAL_CI_CONTAINERS=$(docker ps --filter ancestor=$image -q)
        if [[ -n $LOCAL_CI_CONTAINERS ]]; then
          docker stop $LOCAL_CI_CONTAINERS
          docker rm $LOCAL_CI_CONTAINERS
        fi
      done
      docker rmi $LOCAL_CI_IMAGES`,
    ],
    getSpawnOptions()
  );
}
