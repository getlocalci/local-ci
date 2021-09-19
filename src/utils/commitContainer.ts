import * as cp from 'child_process';
import getSpawnOptions from './getSpawnOptions';
import { GET_CONTAINER_FUNCTION } from '../constants';

// Commits the latest container so that this can open an interactive session when it finishes.
// Contianers exit when they finish.
// So this creates an alternative container for shell access.
export default function commitContainer(
  dockerImage: string,
  newImageName: string
): void {
  cp.spawnSync(
    '/bin/sh',
    [
      '-c',
      `${GET_CONTAINER_FUNCTION}
      if [[ -n $(get_container ${dockerImage}) ]]; then
        docker commit $(get_container ${dockerImage}) ${newImageName}:${new Date().getTime()}
      fi`,
    ],
    getSpawnOptions()
  );
}
