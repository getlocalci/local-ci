#!/bin/sh

# shellcheck disable=SC2154
while true
  do
  running_container=$(get_running_container "$docker_image")
  if [ -n "$running_container" ]
    then
    committed_image=$(docker commit --pause=false "$running_container" "$image_repo":"$(date +"%s")")
    if [ -n "$committed_image" ]
      then
      latest_committed_image=$(docker images "$image_repo" --format "{{.ID}} {{.Tag}}" | sort -k 2 -h | tail -n1 | awk "{print $1}")
      for previous_image in $(docker images -q "$image_repo")
        do
        if [ "$previous_image" != "$latest_committed_image" ]
          then
          docker rmi "$previous_image"
        fi
      done
    fi
  fi

  sleep 2
done
