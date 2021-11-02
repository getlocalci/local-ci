import * as cp from 'child_process';
import getSpawnOptions from './getSpawnOptions';
import { GET_RUNNING_CONTAINER_FUNCTION } from '../constants';

// Commits the latest container so that this can open an interactive session when it finishes.
// Contianers exit when they finish.
// So this creates an alternative container for shell access.
export default function commitContainer(
  dockerImage: string,
  newImageRepo: string
): void {
  const newImageRepoAndTag = `${newImageRepo}:${new Date().getTime()}`;
  cp.spawn(
    '/bin/sh',
    [
      '-c',
      `${GET_RUNNING_CONTAINER_FUNCTION}
      if [[ -n $(get_running_container ${dockerImage}) ]]; then
        docker commit --pause=false $(get_running_container ${dockerImage}) ${newImageRepoAndTag}
      fi`,
    ],
    getSpawnOptions()
  );
}
