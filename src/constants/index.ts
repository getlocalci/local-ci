import * as path from 'path';

export const EXTENSION_ID = 'LocalCI.local-ci';
export const COMMITTED_IMAGE_NAMESPACE = 'local-ci';
export const SELECTED_CONFIG_PATH = 'local-ci.config.path';
export const LICENSE_ERROR = 'localCiLicenseKeyError';
export const GET_LICENSE_COMMAND = 'local-ci.license.get';
export const ENTER_LICENSE_COMMAND = 'local-ci.license.enter';
export const EXIT_JOB_COMMAND = 'local-ci.job.exit';
export const PROCESS_TRY_AGAIN_COMMAND = 'local-ci.process-error.try-again';

export const GET_RUNNING_CONTAINER_FUNCTION = `get_running_container() {
  IMAGE=$1
  for container in $(docker ps -q --filter status=running)
    do
    if [[ $IMAGE == $(docker inspect --format '{{.Config.Image}}' $container) ]]
      then
      echo $container
      break
    fi
  done
}`;
export const GET_PICARD_CONTAINER_FUNCTION = `get_picard_container() {
  JOB_NAME=$1
  for container in $(docker ps -q);
    do
    if [[ $(docker inspect $(docker inspect $container --format {{.Image}}) --format {{.RepoDigests}}) == *"circleci/picard"* ]] && [[ $(docker inspect $container --format {{.Args}} | grep $JOB_NAME) ]]
      then
      echo $container
      break
    fi
    done
}`;
export const GET_LICENSE_KEY_URL =
  'https://getlocalci.com/pricing/?utm_medium=extension&utm_source=ui';
export const EMAIL_ENDPOINT = 'https://getlocalci.com/wp-json/gf/v2/entries';
export const EMAIL_AUTHORIZATION_HEADER =
  'Y2tfYThkZmRlYzcxYTNkNTUxM2I1NmI5N2I0NzdhODk0ODU4NTg1ZWUzZjpjc19hYzNlNWFiNjMzNGRlNjcyOTZjYmNhNmVjYmM3MDVjYzMwMzU4ZTUw';
export const HELP_URL = 'https://github.com/getlocalci/local-ci/discussions';
export const JOB_TREE_VIEW_ID = 'localCiJobs';
export const LICENSE_ITEM_ID = 43;
export const LICENSE_KEY = 'local-ci.license.key';
export const LICENSE_VALIDITY = 'local-ci.license.validity';
export const LICENSE_VALIDITY_CACHE_EXPIRATION =
  'local-ci.license.cache.expiration';
export const TRIAL_LENGTH_IN_MILLISECONDS = 1296000000; // 15 days.
export const EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS = 1296000000; // 15 days.
export const HAS_EXTENDED_TRIAL = 'local-ci.license.trial-extended.survey';
export const TRIAL_STARTED_TIMESTAMP =
  'local-ci.license.trial-started.timestamp';
export const CONTAINER_STORAGE_DIRECTORY = '/tmp/local-ci';
export const DYNAMIC_CONFIG_FILE_NAME = 'dynamic-config.yml';
export const DYNAMIC_CONFIG_PARAMETERS_FILE_NAME =
  'dynamic-config-parameters.json';
export const DYNAMIC_CONFIG_PATH_IN_CONTAINER = path.join(
  CONTAINER_STORAGE_DIRECTORY,
  DYNAMIC_CONFIG_FILE_NAME
);
export const HOST_TMP_DIRECTORY = '/tmp/local-ci';
export const RUN_JOB_COMMAND = 'local-ci.job.run';
export const CREATE_CONFIG_FILE_COMMAND = 'local-ci.create.config';
export const SHOW_LOG_FILE_COMMAND = 'local-ci.show.log-file';
export const LOG_FILE_SCHEME = 'local-ci-log';
export const CONTINUE_PIPELINE_STEP_NAME = 'Continue the pipeline';
export const SCHEDULE_INTERVIEW_URL =
  'https://tidycal.com/localci/30-minute-meeting';
export const SUPPRESS_UNCOMMITTED_FILE_WARNING =
  'local-ci.suppress-warning.uncommitted';
export const SURVEY_URL = 'https://www.surveymonkey.com/r/J2HWF5S';
export const TELEMETRY_KEY = '90189d4e-b560-4a92-aa2c-5a9df190b66a'; // Microsoft.AppInsights Instrumentation Key.
