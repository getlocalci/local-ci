#!/bin/sh

# shellcheck disable=SC2154
for directory_candidate in $restore_from_directories
  do
  if [ "$(find "$directory_candidate" 2>/dev/null)" ]
    then
    verified_directory=$(find "$directory_candidate" | tail -n1)
    echo "Restoring cached directory $verified_directory";
    cp -Lrn "$verified_directory" "$lci_restore_cache_dirname" || cp -Lru "$verified_directory" "$lci_restore_cache_dirname";
    break;
  fi
done
