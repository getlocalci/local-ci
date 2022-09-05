import * as cp from 'child_process';
import getSpawnOptions from 'common/Spawn';
import { getRunningContainerFunction } from 'scripts/';

/**
 * Commits the latest container so that this can open an interactive session when it finishes.
 *
 * Containers exit when they finish.
 * So this creates an alternative container for shell access.
 * This starts by removing previous images of the same repo, as images can be 1-2 GB each.
 * The while loop has a [ true ] condition because runJob()
 * ends this process with .kill().
 */
export default function commitContainer(
  dockerImage: string,
  imageRepo: string
): cp.ChildProcess {
  return cp.spawn(
    '/bin/sh',
    [
      '-c',
      `${getRunningContainerFunction}

      while [ true ]
        do
        running_container=$(get_running_container ${dockerImage})
        if [[ -n $running_container ]]
          then
          committed_image=$(docker commit --pause=false $running_container ${imageRepo}:$(date +"%s"))
          if [[ -n $committed_image ]]
            then
            latest_committed_image=$(docker images ${imageRepo} --format "{{.ID}} {{.Tag}}" | sort -k 2 -h | tail -n1 | awk '{print $1}')
            for previous_image in $(docker images -q "${imageRepo}")
              do
              if [[ $previous_image != $latest_committed_image ]]
                then
                docker rmi $previous_image
              fi
            done
          fi
        fi

        sleep 2
      done`,
    ],
    getSpawnOptions()
  );
}
