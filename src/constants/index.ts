export const COMMITTED_IMAGE_NAMESPACE = 'local-ci';
export const LICENSE_ERROR = 'localCiLicenseKeyError';
export const GET_LICENSE_COMMAND = 'local-ci.license.get';
export const ENTER_LICENSE_COMMAND = 'local-ci.license.enter';
export const EXIT_JOB_COMMAND = 'local-ci.job.exit';
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
export const GET_LATEST_COMMITTED_IMAGE_FUNCTION = `get_latest_committed_image() {
  IMAGE=$1
  docker images --filter reference=$IMAGE --format "{{.ID}} {{.Tag}}" | sort -k 2 -h | tail -n1 | awk '{print $1}'
}`;
export const GET_LICENSE_KEY_URL = 'https://getlocalci.com';
export const HELP_URL = 'https://getlocalci.com';
export const JOB_TREE_VIEW_ID = 'localCiJobs';
export const LICENSE_ITEM_ID = 43;
export const LICENSE_KEY = 'local-ci.license.key';
export const LICENSE_VALIDITY = 'local-ci.license.validity.cached';
export const LICENSE_VALIDITY_CACHE_EXPIRATION =
  'local-ci.license.cache.expiration';
export const TRIAL_LENGTH_IN_MILLISECONDS = 172800000; // 2 days.
export const TRIAL_STARTED_TIMESTAMP =
  'local-ci.license.trial-started.timestamp';
export const HOST_TMP_PATH = '/tmp/local-ci'; // Also hard-coded in node/uninstall.js, change that if this changes.
export const PROCESS_FILE_PATH = `${HOST_TMP_PATH}/process.yml`;
export const RUN_JOB_COMMAND = 'local-ci.job.run';
