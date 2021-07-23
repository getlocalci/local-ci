import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

type ConfigFile = { jobs: Array<Record<string, unknown>> };

export async function getConfigFile(configFilePath = ''): Promise<ConfigFile> {
  return yaml.load(fs.readFileSync(configFilePath, 'utf8'));
}

export async function getJobs(configFilePath = ''): Promise<string[] | []> {
  const configFile = await getConfigFile(configFilePath);
  return typeof configFile === 'object'
    ? Object.keys(configFile?.jobs ?? {})
    : [];
}

export async function getCheckoutJobs(inputFile = ''): Promise<string[]> {
  const configFile = await getConfigFile(inputFile);
  if (typeof configFile !== 'object') {
    return [];
  }

  return Object.keys(configFile.jobs).filter((jobName) => {
    return configFile.jobs[jobName]?.steps.some(
      (step: { checkout: unknown }) => 'checkout' === step || step.checkout
    );
  });
}

export async function changeCheckoutJob(processFile: string): Promise<T> {
  const checkoutJobs = await getCheckoutJobs(processFile);
  const configFile = await getConfigFile(processFile);

  if (!checkoutJobs.length) {
    fs.writeFileSync(processFile, yaml.dump(configFile));
    return;
  }

  checkoutJobs.forEach((checkoutJob) => {
    configFile.jobs[checkoutJob].steps = configFile.jobs[checkoutJob].steps.map(
      (step) => {
        if (!step?.persist_to_workspace) {
          return step;
        }

        const fullPath =
          !step?.persist_to_workspace?.root ||
          '.' === step.persist_to_workspace.root
            ? `${configFile.jobs[checkoutJob].working_directory}/${step.persist_to_workspace.paths[0]}`
            : `${step.persist_to_workspace.root}/${step.persist_to_workspace.paths[0]}`;

        return step.persist_to_workspace
          ? {
              run: {
                command: `cp -ruv ${fullPath} /tmp/checkout`,
              },
            }
          : step;
      }
    );
  });

  fs.writeFileSync(processFile, yaml.dump(configFile));
}
