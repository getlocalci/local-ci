#!/bin/sh

# shellcheck disable=SC2154
lci_images=$(docker images -q --filter=reference="$lci_image_pattern")
echo "$lci_images" | while read -r image
  do
  if [ ! "$image" ] || [ "$lci_image_to_exclude" = "$image" ]
    then
    continue
  fi
  lci_containers=$(docker ps --filter ancestor="$image" -q)
  if [ "$lci_containers" ]
    then
    echo "$lci_containers" | xargs docker stop
    echo "$lci_containers" | xargs docker rm
  fi

  docker rmi "$image"
done
