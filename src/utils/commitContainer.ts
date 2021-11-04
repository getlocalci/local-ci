import * as cp from 'child_process';
import getSpawnOptions from './getSpawnOptions';
import { GET_RUNNING_CONTAINER_FUNCTION } from '../constants';

// Commits the latest container so that this can open an interactive session when it finishes.
// Contianers exit when they finish.
// So this creates an alternative container for shell access.
// This starts be removing previous images of the same repo, as images can be 1-2 GB each.
export default function commitContainer(
  dockerImage: string,
  imageRepo: string
): void {
  const newImageRepoAndTag = `${imageRepo}:${new Date().getTime()}`;
  cp.spawn(
    '/bin/sh',
    [
      '-c',
      `${GET_RUNNING_CONTAINER_FUNCTION}

      running_container=$(get_running_container ${dockerImage})
      if [[ -n $running_container ]]; then
        latest_committed_image=$(docker images ${imageRepo} --format "{{.ID}} {{.Tag}}" | sort -k 2 -h | tail -n1 | awk '{print $1}')
        for previous_image in $(docker images -q "${imageRepo}"); do
          if [[ $previous_image != $latest_committed_image ]]; then
            docker rmi $previous_image
          fi
        done;

        docker commit --pause=false $running_container ${newImageRepoAndTag}
      fi`,
    ],
    getSpawnOptions()
  );
}
