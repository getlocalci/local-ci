#!/bin/sh

get_picard_container() {
  JOB_NAME=$1
  for container in $(docker ps -q);
    do
    if [ "$(docker inspect $(docker inspect $container --format {{.Image}}) --format {{.RepoDigests}}) == *"circleci/picard"* ] && [ $(docker inspect $container --format {{.Args}} | grep $JOB_NAME)" ]
      then
      echo $container
      break
    fi
    done
}
