export const COMMITTED_IMAGE_NAMESPACE = 'local-ci';
export const SELECTED_CONFIG_PATH = 'local-ci.config.path';
export const LICENSE_ERROR = 'localCiLicenseKeyError';
export const GET_LICENSE_COMMAND = 'local-ci.license.get';
export const ENTER_LICENSE_COMMAND = 'local-ci.license.enter';
export const EXIT_JOB_COMMAND = 'local-ci.job.exit';

// @todo: Look at an alternative, as docker inspect hangs sometimes: https://github.com/docker/for-linux/issues/397
export const GET_CONTAINER_FUNCTION = `get_container() {
  IMAGE=$1
  for container in $(docker ps -q); do
    if [[ $IMAGE == $(docker inspect --format '{{.Config.Image}}' $container) ]]; then
      echo $container
      break
    fi
  done
}`;
export const GET_RUNNING_CONTAINER_FUNCTION = `get_running_container() {
  IMAGE=$1
  for container in $(docker ps -q --filter status=running); do
    if [[ $IMAGE == $(docker inspect --format '{{.Config.Image}}' $container) ]]; then
      echo $container
      break
    fi
  done
}`;
export const GET_PICARD_CONTAINER_FUNCTION = `get_picard_container() {
  for container in $(docker ps -q); do
    if [[ $(docker inspect $(docker inspect $container --format {{.Image}}) --format {{.RepoDigests}}) == *"circleci/picard"* ]]; then
      echo $container
      break
    fi
  done
}`;
export const GET_LICENSE_KEY_URL = 'https://getlocalci.com/pricing';
export const HELP_URL = 'https://github.com/getlocalci/local-ci/discussions';
export const JOB_TREE_VIEW_ID = 'localCiJobs';
export const LICENSE_ITEM_ID = 43;
export const LICENSE_KEY = 'local-ci.license.key';
export const LICENSE_VALIDITY = 'local-ci.license.validity';
export const LICENSE_VALIDITY_CACHE_EXPIRATION =
  'local-ci.license.cache.expiration';
export const TRIAL_LENGTH_IN_MILLISECONDS = 172800000; // 2 days.
export const EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS = 1296000000; // 15 days.
export const HAS_EXTENDED_TRIAL = 'local-ci.license.trial-extended.survey';
export const TRIAL_STARTED_TIMESTAMP =
  'local-ci.license.trial-started.timestamp';
export const CONTAINER_STORAGE_DIRECTORY = '/tmp/local-ci';
export const HOST_TMP_DIRECTORY = '/tmp/local-ci'; // Also hard-coded in node/uninstall.js, change that if this changes.
export const PROCESS_FILE_DIRECTORY = `${HOST_TMP_DIRECTORY}/process`;
export const LOCAL_VOLUME_DIRECTORY = `${HOST_TMP_DIRECTORY}/volume`;
export const RUN_JOB_COMMAND = 'local-ci.job.run';
export const SCHEDULE_INTERVIEW_URL = 'https://example.com';
export const SUPPRESS_UNCOMMITTED_FILE_WARNING =
  'local-ci.suppress-warning.uncommitted';
export const SURVEY_URL = 'https://example.com';
