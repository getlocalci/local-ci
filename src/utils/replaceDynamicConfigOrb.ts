import * as path from 'path';
import {
  CONTAINER_STORAGE_DIRECTORY,
  CONTINUE_PIPELINE_STEP_NAME,
} from '../constants';

// Overwrites the dynamic config continuation orb: https://circleci.com/developer/orbs/orb/circleci/continuation
// Normally, that orb makes a POST request to CircleCI® with the generated config file.
// But that doesn't work locally, and maybe it shouldn't.
// To make it work locally, this stores the generated config file at
// /tmp/local-ci/config.yml
// Then, this extension will have access to that file because it's in a mounted volume,
// and it can show its jobs.
export default function replaceDynamicConfigOrb(config: CiConfig): CiConfig {
  if (!config) {
    return config;
  }

  return {
    ...config,
    jobs: Object.keys(config.jobs).reduce(
      (accumulator: Jobs, jobName: string) => {
        if (!config || !config.jobs[jobName]?.steps) {
          return {
            ...accumulator,
            [jobName]: config?.jobs[jobName],
          };
        }

        return {
          ...accumulator,
          [jobName]: {
            ...config.jobs[jobName],
            steps: config.jobs[jobName].steps?.map((step: Step) => {
              if (typeof step === 'string') {
                return step;
              }

              if (step['continuation/continue']?.configuration_path) {
                const dynamicConfigPath = path.join(
                  CONTAINER_STORAGE_DIRECTORY,
                  'config.yml'
                );
                return {
                  run: {
                    name: CONTINUE_PIPELINE_STEP_NAME,
                    command: `if [ -f ${dynamicConfigPath} ]; then rm ${dynamicConfigPath}; fi; cp ${step['continuation/continue']?.configuration_path} ${dynamicConfigPath};`,
                  },
                };
              }

              return step;
            }),
          },
        };
      },
      {}
    ),
  };
}
