import * as cp from 'child_process';
import { GET_ALL_CONTAINERS_FUNCTION } from '../constants';
import getSpawnOptions from './getSpawnOptions';

export default function cleanUpCommittedImage(
  committedImageName: string
): void {
  cp.spawnSync(
    '/bin/sh',
    [
      '-c',
      `${GET_ALL_CONTAINERS_FUNCTION}
      docker stop $(get_all_containers $(docker images -q --filter reference=${committedImageName}))
      docker rm $(get_all_containers $(docker images -q --filter reference=${committedImageName}))`,
    ],
    getSpawnOptions()
  );

  cp.spawnSync(
    '/bin/sh',
    [
      '-c',
      `docker rmi $(docker images -q --filter reference=${committedImageName})`,
    ],
    getSpawnOptions()
  );
}
