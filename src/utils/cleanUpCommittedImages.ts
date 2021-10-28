import * as cp from 'child_process';
import { GET_ALL_CONTAINERS_FUNCTION } from '../constants';
import getSpawnOptions from './getSpawnOptions';

export default function cleanUpCommittedImages(imagePattern: string): void {
  cp.spawn(
    '/bin/sh',
    [
      '-c',
      `${GET_ALL_CONTAINERS_FUNCTION}
      LOCAL_CI_IMAGES=$(docker images -q --filter reference="${imagePattern}")
      for image in $LOCAL_CI_IMAGES
        do
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
