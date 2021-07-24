import { exec } from 'child_process';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { promisify } from 'util';
import * as vscode from 'vscode';

type ConfigFile = { jobs: Array<Record<string, unknown>> };

export async function getConfigFile(
  configFilePath = ''
  // eslint-disable-next-line @typescript-eslint/ban-types
): Promise<ConfigFile | string | number | object | null | undefined> {
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

  return Object.keys(configFile.jobs).filter((jobName: string) => {
    return configFile.jobs[jobName]?.steps.some(
      (step: { checkout: Record<string, unknown> | string }) =>
        'checkout' === step || step.checkout
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

  checkoutJobs.forEach((checkoutJob: string) => {
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

export async function runJob(jobName: string): Promise<void> {
  const processFile = 'process.yml';

  const terminal = vscode.window.createTerminal({
    name: 'localci test',
    message: `Running the CircleCI job ${jobName}`,
  });

  const runCommand = promisify(exec);
  try {
    await runCommand(
      `circleci config process ${vscode.workspace.rootPath}/.circleci/config.yml > /tmp/circleci/${processFile}`
    );
  } catch (e) {
    terminal.sendText(`echo "Error when processing the config: ${e.message}"`);
  }

  await changeCheckoutJob(`/tmp/circleci/${processFile}`);
  const checkoutJobs = await getCheckoutJobs(`/tmp/circleci/${processFile}`);
  const directoryMatches = vscode.workspace.workspaceFolders.length
    ? vscode.workspace.workspaceFolders[0].name.match(/[^/]+$/)
    : '';
  const directory = directoryMatches ? directoryMatches[0] : '';

  const configFile = await getConfigFile(`/tmp/circleci/${processFile}`);
  const attachWorkspaceSteps = configFile?.jobs[jobName]?.steps.filter(
    (step: { attach_workspace: string }) => Boolean(step.attach_workspace) // eslint-disable-line @typescript-eslint/naming-convention
  );
  const defaultWorkspace = '/home/circleci/project';
  const initialAttachWorkspace = attachWorkspaceSteps.length
    ? attachWorkspaceSteps[0].attach_workspace.at
    : '';
  const attachWorkspace =
    '.' === initialAttachWorkspace || !initialAttachWorkspace
      ? defaultWorkspace
      : initialAttachWorkspace;

  const localVolume = `/tmp/circleci/${directory}`;
  const volume = checkoutJobs.includes(jobName)
    ? `${localVolume}:/tmp/checkout`
    : `${localVolume}:${attachWorkspace}`;
  const debuggingTerminalName = 'localci debugging';
  const finalTerminalName = 'localci final terminal';

  const command = `circleci local execute --job ${jobName} --config /tmp/circleci/${processFile} --debug -v ${volume}`;
  terminal.sendText(`mkdir -p ${localVolume}`);
  terminal.sendText(command);
  terminal.show();

  const setDelay = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));
  await setDelay(12000);
  const debuggingTerminal = vscode.window.createTerminal({
    name: debuggingTerminalName,
    message: 'This is inside the running container',
  });
  const latestContainer = '$(docker ps -lq)';
  const committedContainerBase = 'local-ci-';

  debuggingTerminal.show();

  // Ensure the latest container is not circleci/picard, which is the container that runs jobs.
  // If it is, keep waiting.
  // Then, start an interactive bash session within the container.
  debuggingTerminal.sendText(`
    until [[ -n ${latestContainer} && "circleci/picard" != $(docker inspect --format='{{.Config.Image}}' ${latestContainer}) ]]
    do
      sleep 5
    done
    docker exec -it ${latestContainer} bash || exit 1`);

  const finalTerminal = vscode.window.createTerminal({
    name: finalTerminalName,
    message: 'Debug the final state of the container',
    hideFromUser: true,
  });

  // Commit the latest container so that this can open an interactive session when it finishes.
  // Contianers exit when they finish.
  // So this creates an alternative container for shell access.
  const interval = setInterval(() => {
    finalTerminal.sendText(
      `docker commit ${latestContainer} ${committedContainerBase}${jobName}`
    );
  }, 5000);

  vscode.window.onDidCloseTerminal((closedTerminal) => {
    clearTimeout(interval);
    if (
      closedTerminal.name === debuggingTerminalName &&
      closedTerminal?.exitStatus?.code
    ) {
      // @todo: handle if debuggingTerminal exits because terminal hasn't started the container.
      finalTerminal.sendText(
        `docker run -it ${committedContainerBase}${jobName}`
      );
      finalTerminal.show();
    }

    if (closedTerminal.name === finalTerminalName) {
      // Remove the image that was a copy of the running CircleCI job container.
      closedTerminal.sendText(`docker rmi ${committedContainerBase}${jobName}`);
      return;
    }
  });
}
