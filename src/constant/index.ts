import * as path from 'path';

export const EXTENSION_ID = 'LocalCI.local-ci';
export const COMMITTED_IMAGE_NAMESPACE = 'local-ci';
export const SELECTED_CONFIG_PATH = 'local-ci.config.path';
export const LICENSE_ERROR = 'localCiLicenseKeyError';
export const GET_LICENSE_COMMAND = 'local-ci.license.get';
export const ENTER_LICENSE_COMMAND = 'local-ci.license.enter';
export const COMPLAIN_COMMAND = 'local-ci.email.complain';
export const COMPLAIN_URL =
  'mailto:ryan@getlocalci.com?subject=Something went wrong in Local CI&body=Hi Ryan, Could you help with this problem in Local CI: <!-- please fill in problem here -->';
export const EXIT_JOB_COMMAND = 'local-ci.job.exit';
export const PROCESS_TRY_AGAIN_COMMAND = 'local-ci.process-error.try-again';
export const GET_LICENSE_KEY_URL =
  'https://getlocalci.com/pricing/?utm_medium=extension&utm_source=ui';
export const EMAIL_ENDPOINT =
  'https://getlocalci.com/wp-json/gf-integration/v1/email';
export const HELP_URL = 'https://github.com/getlocalci/local-ci/discussions';
export const JOB_TREE_VIEW_ID = 'localCiJobs';
export const DO_NOT_CONFIRM_RUN_JOB = 'local-ci.job.do-not-confirm';
export const LICENSE_ITEM_ID = 43;
export const LICENSE_KEY = 'local-ci.license.key';
export const LICENSE_TREE_VIEW_ID = 'localCiLicense';
export const LICENSE_VALIDITY = 'local-ci.license.validity';
export const LICENSE_VALIDITY_CACHE_EXPIRATION =
  'local-ci.license.cache.expiration';
export const DAY_IN_MILLISECONDS = 86400000;
export const TRIAL_LENGTH_IN_MILLISECONDS = 30 * DAY_IN_MILLISECONDS;
export const EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS = 15 * DAY_IN_MILLISECONDS;
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
export const RERUN_JOB_COMMAND = 'local-ci.job.rerun';
export const CREATE_CONFIG_FILE_COMMAND = 'local-ci.create.config';
export const SELECT_REPO_COMMAND = 'localCiJobs.selectRepo';
export const START_DOCKER_COMMAND = 'local-ci.docker.start';
export const SHOW_LOG_FILE_COMMAND = 'local-ci.show.log-file';
export const LOG_FILE_SCHEME = 'local-ci-log';
export const CONTINUE_PIPELINE_STEP_NAME = 'Continue the pipeline';
export const SCHEDULE_INTERVIEW_URL =
  'https://tidycal.com/localci/30-minute-meeting';
export const SUPPRESS_UNCOMMITTED_FILE_WARNING =
  'local-ci.suppress-warning.uncommitted';
export const SUPPRESS_JOB_COMPLETE_MESSAGE =
  'local-ci.suppress-message.job-complete';
export const TELEMETRY_KEY = '90189d4e-b560-4a92-aa2c-5a9df190b66a'; // Microsoft.AppInsights Instrumentation Key.
