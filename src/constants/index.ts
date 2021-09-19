export const GET_ALL_CONTAINERS_FUNCTION = `get_all_containers() {
  IMAGE=$1
  docker ps --filter ancestor=$IMAGE -q
}`;
// @todo: Look at alternative, as docker inspect hangs sometimes: https://github.com/docker/for-linux/issues/397
export const GET_CONTAINER_FUNCTION = `get_container() {
  IMAGE=$1
  for container in $(docker ps -q)
    do
      if [[ $IMAGE == $(docker inspect --format '{{.Config.Image}}' $container) ]]; then
        echo $container
        break
      fi
    done
}`;
export const GET_RUNNING_CONTAINER_FUNCTION = `get_running_container() {
  IMAGE=$1
  for container in $(docker ps -q --filter status=running)
    do
      if [[ $IMAGE == $(docker inspect --format '{{.Config.Image}}' $container) ]]; then
        echo $container
        break
      fi
    done
}`;
export const TMP_PATH = '/tmp/local-ci';
export const PROCESS_FILE_PATH = `${TMP_PATH}/process.yml`;
export const RUN_JOB_COMMAND = 'local-ci.runJob';
