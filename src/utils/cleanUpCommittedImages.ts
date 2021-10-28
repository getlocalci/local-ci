import * as cp from 'child_process';
import getSpawnOptions from './getSpawnOptions';

export default function cleanUpCommittedImages(
  imagePattern: string,
  imageToExclude?: string
): void {
  cp.spawn(
    '/bin/sh',
    [
      '-c',
      `get_all_containers() {
        IMAGE=$1
        docker ps --filter ancestor=$IMAGE -q
      }
      LOCAL_CI_IMAGES=$(docker images -q --filter reference="${imagePattern}")
      echo $LOCAL_CI_IMAGES | while read image; do
        if [[ ${imageToExclude} == $image ]]; then
          continue
        fi
        LOCAL_CI_CONTAINERS=$(get_all_containers $image)
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
