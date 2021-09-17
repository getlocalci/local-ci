// @todo: makes this more robust.
// Ideally, it'd use docker inspect to get the image.
// But that hangs sometimes: https://github.com/docker/for-linux/issues/397
export const GET_CONTAINER_FUNCTION = `get_container() {
    IMAGE=$1
    docker ps --filter ancestor=$IMAGE --filter status=running -lq
  }`;
export const TMP_PATH = '/tmp/local-ci';
export const PROCESS_FILE_PATH = `${TMP_PATH}/process.yml`;
export const RUN_JOB_COMMAND = 'local-ci.runJob';
