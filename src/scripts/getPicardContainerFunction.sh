#!/bin/sh

get_picard_container() {
  JOB_NAME=$1
  for container in $(docker ps -q);
    do
    if docker inspect "$container" --format '{{.Args}}' | grep -q "$JOB_NAME" && docker inspect "$(docker inspect "$container" --format '{{.Image}}')" --format '{{.RepoDigests}}' | grep -q "circleci/picard"
      then
      echo "$container"
      break
    fi
    done
}
