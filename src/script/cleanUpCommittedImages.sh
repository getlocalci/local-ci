#!/bin/sh

# shellcheck disable=SC2154
lci_images=$(docker images -q lci_image_pattern)
echo "$local_ci_images" | while read -r image
  do
  if [ "$lci_image_to_exclude" = "$image" ]
    then
    continue
  fi
  lci_containers=$(docker ps --filter ancestor="$image" -q)
  if [ -n "$lci_containers" ]
    then
    docker stop "$lci_containers"
    docker rm "$lci_containers"
  fi
done
docker rmi "$lci_images"
