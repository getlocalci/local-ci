#!/bin/sh

printf "You'll get bash access to the job once this conditional is true:\n"
until [ -n "$(get_running_container "$LCI_JOB_IMAGE")" ]
  do
  sleep 1
done
echo "Inside the job's container:"
docker exec -it "$(get_running_container "$LCI_JOB_IMAGE")" /bin/sh || exit 1
