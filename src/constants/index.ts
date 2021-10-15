export const LICENSE_ERROR = 'localCiLicenseKeyError';
export const GET_LICENSE_COMMAND = 'localCi/getLicense';
export const ENTER_LICENSE_COMMAND = 'localCi/enterLicense';
export const EXIT_JOB_COMMAND = 'localCi/exitJob';
export const GET_ALL_CONTAINERS_FUNCTION = `get_all_containers() {
  IMAGE=$1
  docker ps --filter ancestor=$IMAGE -q
}`;
// @todo: Look at an alternative, as docker inspect hangs sometimes: https://github.com/docker/for-linux/issues/397
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
export const GET_LICENSE_KEY_URL = 'https://getlocalci.com';
export const HELP_URL = 'https://getlocalci.com';
export const LICENSE_ITEM_ID = 43;
export const LICENSE_KEY = 'localCi:license:key';
export const LICENSE_VALIDITY = 'localCi/cachedLicenseValidity';
export const LICENSE_VALIDITY_CACHE_EXPIRATION = 'localCi:license:cachedTime';
export const PREVIEW_LENGTH_IN_MILLISECONDS = 172800000; // 2 days.
export const PREVIEW_STARTED_TIMESTAMP = 'localCi:license:whenPreviewStarted';
export const TMP_PATH = '/tmp/local-ci'; // Also hard-coded in node/uninstall.js, change that if this changes.
export const PROCESS_FILE_PATH = `${TMP_PATH}/process.yml`;
export const RUN_JOB_COMMAND = 'local-ci.runJob';
