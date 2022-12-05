#!/bin/sh

get_running_container() {
  IMAGE=$1
  for container in $(docker ps -q --filter status=running)
    do
    if [ "$IMAGE" = "$(docker inspect --format '{{.Config.Image}}' "$container")" ]
      then
      echo "$container"
      break
    fi
  done
}
