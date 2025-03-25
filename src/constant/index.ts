import * as path from 'path';

export const EXTENSION_ID = 'LocalCI.local-ci';
export const COMMITTED_IMAGE_NAMESPACE = 'local-ci';
export const SELECTED_CONFIG_PATH = 'local-ci.config.path';
export const EXIT_JOB_COMMAND = 'local-ci.job.exit';
export const PROCESS_TRY_AGAIN_COMMAND = 'local-ci.process-error.try-again';
export const HELP_URL = 'https://github.com/getlocalci/local-ci/discussions';
export const JOB_TREE_VIEW_ID = 'localCiJobs';
export const DO_NOT_CONFIRM_RUN_JOB = 'local-ci.job.do-not-confirm';
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
