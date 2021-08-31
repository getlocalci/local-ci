import * as cp from 'child_process';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as vscode from 'vscode';
import { getBinaryPath } from '../setup/binary.js';

interface Step {
  checkout?: Record<string, unknown> | string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  attach_workspace?: {
    at?: string;
  };
  // eslint-disable-next-line @typescript-eslint/naming-convention
  persist_to_workspace?: {
    root?: string;
    paths?: Array<string>;
  };
  run?: {
    command?: string;
  };
}

interface ConfigFile {
  jobs: Record<
    string,
    {
      docker: Array<Record<string, string>>;
      steps?: Array<Step>;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      working_directory?: string;
    }
  >;
}

export function getConfigFile(configFilePath: string): ConfigFile {
  return yaml.load(fs.readFileSync(configFilePath, 'utf8')) as ConfigFile;
}

export function getJobs(configFilePath: string): string[] | [] {
  return Object.keys(getConfigFile(configFilePath)?.jobs ?? {});
}

/** Gets the names of the jobs that have a 'checkout' step. */
export function getCheckoutJobs(inputFile: string): string[] {
  const configFile = getConfigFile(inputFile);

  return Object.keys(configFile?.jobs ?? []).filter((jobName) =>
    configFile.jobs[jobName]?.steps?.some(
      (step) => 'checkout' === step || step.checkout
    )
  );
}

export function getSpawnOptions(): Record<string, unknown> {
  return {
    cwd: getRootPath(),
    env: {
      ...process.env,
      PATH: '/usr/local/bin', // eslint-disable-line @typescript-eslint/naming-convention
    },
  };
}

export function getCheckoutDirectoryBasename(processFile: string): string {
  const checkoutJobs = getCheckoutJobs(processFile);
  const configFile = getConfigFile(processFile);

  if (!configFile || !checkoutJobs.length) {
    return '';
  }

  const checkoutJob = checkoutJobs[0];
  if (!configFile.jobs[checkoutJob]?.steps) {
    return '';
  }

  const stepWithPersist = configFile?.jobs[checkoutJob]?.steps?.find(
    (step) => step?.persist_to_workspace
  );

  const persistToWorkspacePath = stepWithPersist?.persist_to_workspace?.paths
    ?.length
    ? stepWithPersist.persist_to_workspace.paths[0]
    : '';

  const pathBase =
    !stepWithPersist?.persist_to_workspace?.root ||
    '.' === stepWithPersist.persist_to_workspace.root
      ? configFile.jobs[checkoutJob]?.working_directory ??
        getDefaultWorkspace(configFile.jobs[checkoutJob]?.docker[0]?.image)
      : stepWithPersist.persist_to_workspace.root;

  // If the checkout job has a persist_to_workspace of /tmp,
  // no need to get a checkout directory.
  // The volume will mount to /tmp, so it's already in the correct directory.
  if (pathBase.match(/\/tmp\/?$/)) {
    return '';
  }

  const pattern = /[^/]+$/;
  const pathMatches =
    !persistToWorkspacePath || persistToWorkspacePath === '.'
      ? pathBase.match(pattern)
      : persistToWorkspacePath.match(pattern);

  return pathMatches ? pathMatches[0] : '';
}

export function writeProcessFile(processFile: string): void {
  const checkoutJobs = getCheckoutJobs(processFile);
  const configFile = getConfigFile(processFile);

  if (!configFile) {
    return;
  }

  if (!checkoutJobs.length) {
    fs.writeFileSync(processFile, yaml.dump(configFile));
    return;
  }

  checkoutJobs.forEach((checkoutJob: string) => {
    if (!configFile || !configFile.jobs[checkoutJob]?.steps) {
      return;
    }

    // Simulate persist_to_workspace by copying the persisted files to the volume.
    configFile.jobs[checkoutJob].steps = configFile?.jobs[
      checkoutJob
    ]?.steps?.map((step) => {
      if (!step?.persist_to_workspace) {
        return step;
      }

      const persistToWorkspacePath = step?.persist_to_workspace?.paths?.length
        ? step.persist_to_workspace.paths[0]
        : '';

      const pathBase =
        !step?.persist_to_workspace?.root ||
        '.' === step.persist_to_workspace.root
          ? configFile.jobs[checkoutJob]?.working_directory ??
            getDefaultWorkspace(configFile.jobs[checkoutJob]?.docker[0]?.image)
          : step.persist_to_workspace.root;

      const fullPath =
        !persistToWorkspacePath || persistToWorkspacePath === '.'
          ? pathBase
          : `${pathBase}/${persistToWorkspacePath}`;

      return step.persist_to_workspace && !fullPath.match(/\/tmp\/[^/]+$/)
        ? {
            run: {
              command: `cp -r ${fullPath} /tmp`,
            },
          }
        : step;
    });
  });

  fs.writeFileSync(processFile, yaml.dump(configFile));
}

/** Gets the absolute path to this VS Code workspace. */
export function getRootPath(): string {
  return vscode.workspace?.workspaceFolders?.length
    ? vscode.workspace.workspaceFolders[0]?.uri?.path
    : '';
}

export async function runJob(jobName: string): Promise<void> {
  const tmpPath = '/tmp/local-ci';
  const processFilePath = `${tmpPath}/process.yml`;

  const terminal = vscode.window.createTerminal({
    name: `local-ci ${jobName}`,
    message: `Running the CircleCI job ${jobName}`,
  });

  try {
    const { stdout } = cp.spawnSync(
      getBinaryPath(),
      ['config', 'process', `${getRootPath()}/.circleci/config.yml`],
      getSpawnOptions()
    );
    fs.writeFileSync(processFilePath, stdout.toString().trim());
    writeProcessFile(processFilePath);
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error processing the CircleCI config: ${e.message}`
    );
  }

  const checkoutJobs = getCheckoutJobs(processFilePath);
  const directoryMatches = getRootPath().match(/[^/]+$/);
  const directory = directoryMatches ? directoryMatches[0] : '';
  const localVolume = `${tmpPath}/${directory}`;

  // If this is the only checkout job, rm the entire local volume directory.
  // This job will checkout to that volume, and there could be an error
  // if it attempts to cp to it and the files exist.
  // @todo: fix ocasional permisison denied error for deleting this file.
  if (checkoutJobs.includes(jobName) && 1 === checkoutJobs.length) {
    cp.spawnSync('rm', ['-rf', localVolume], getSpawnOptions());
  }

  const configFile = getConfigFile(processFilePath);
  const attachWorkspaceSteps = configFile?.jobs[jobName]?.steps?.length
    ? (configFile?.jobs[jobName]?.steps as Array<Step>).filter((step) =>
        Boolean(step.attach_workspace)
      )
    : [];

  const dockerImage = configFile?.jobs[jobName]?.docker.length
    ? configFile?.jobs[jobName]?.docker[0]?.image
    : '';

  const initialAttachWorkspace =
    attachWorkspaceSteps.length && attachWorkspaceSteps[0]?.attach_workspace?.at
      ? attachWorkspaceSteps[0].attach_workspace.at
      : '';
  const attachWorkspace =
    '.' === initialAttachWorkspace || !initialAttachWorkspace
      ? getDefaultWorkspace(dockerImage)
      : initialAttachWorkspace;

  const volume = checkoutJobs.includes(jobName)
    ? `${localVolume}:/tmp`
    : `${localVolume}/${getCheckoutDirectoryBasename(
        processFilePath
      )}:${attachWorkspace}`;
  const debuggingTerminalName = `local-ci debugging ${jobName}`;
  const finalTerminalName = 'local-ci final terminal';

  cp.spawnSync('mkdir', ['-p', localVolume], getSpawnOptions());
  terminal.sendText(
    `${getBinaryPath()} local execute --job ${jobName} --config ${processFilePath} --debug -v ${volume}`
  );
  terminal.show();

  const delay = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));
  await delay(5000);
  const debuggingTerminal = vscode.window.createTerminal({
    name: debuggingTerminalName,
    message: 'This is inside the running container',
  });
  const committedContainerBase = 'local-ci-';
  const getContainerDefinition = `get_container() {
    IMAGE=$1
    for container in $(docker ps -q)
    do
    if [[ $(docker inspect --format='{{.Config.Image}}' "$container") == $IMAGE ]]; then
      echo $container
    fi
    done
  }`;

  // Once the container is available, start an interactive bash session within the container.
  debuggingTerminal.sendText(`
    ${getContainerDefinition}
    until [[ -n $(docker ps -q) && $(docker inspect -f '{{ .Config.Image}}' $(docker ps -q) | grep ${dockerImage}) ]]
    do
      sleep 2
    done
    echo "Inside the job's container:"
    docker exec -it $(get_container ${dockerImage}) /bin/sh || exit 1
  `);

  debuggingTerminal.show();

  const finalTerminal = vscode.window.createTerminal({
    name: finalTerminalName,
    message: 'Debug the final state of the container',
    hideFromUser: true,
  });

  finalTerminal.sendText(getContainerDefinition);

  function commitContainer(): void {
    finalTerminal.sendText(
      `if [[ -n $(get_container ${dockerImage}) ]]; then
        docker commit $(get_container ${dockerImage}) ${committedContainerBase}${jobName}
      fi`
    );
  }

  // Commit the latest container so that this can open an interactive session when it finishes.
  // Contianers exit when they finish.
  // So this creates an alternative container for shell access.
  commitContainer();
  const interval = setInterval(commitContainer, 2000);

  vscode.window.onDidCloseTerminal((closedTerminal) => {
    clearTimeout(interval);
    if (
      closedTerminal.name === debuggingTerminalName &&
      closedTerminal?.exitStatus?.code
    ) {
      finalTerminal.show();
      finalTerminal.sendText(
        `echo "Inside a similar container after the job's container exited:"`
      );

      // @todo: handle if debuggingTerminal exits because terminal hasn't started the container.
      finalTerminal.sendText(
        `docker run -it --rm ${committedContainerBase}${jobName}`
      );
    }

    if (closedTerminal.name === finalTerminalName) {
      // Remove the container and image that were copies of the running CircleCI job container.
      const imageName = `${committedContainerBase}${jobName}`;
      cp.spawnSync(
        `${getContainerDefinition} docker rm -f $(get_container ${imageName})`,
        [],
        getSpawnOptions()
      );
    }
  });
}

export function getDefaultWorkspace(imageName: string): string {
  if (!imageName) {
    return '/home/circleci/project';
  }

  try {
    cp.spawnSync(
      `if [[ -z $(docker images -f reference=${getImageWithoutTag(
        imageName
      )}) ]]; then
        docker image pull ${imageName}
      fi`,
      [],
      getSpawnOptions()
    );

    const response = cp.spawnSync(
      'docker',
      ['image', 'inspect', imageName, '--format', '{{.Config.User}}'],
      getSpawnOptions()
    );

    return `/home/${response?.stdout.toString().trim() || 'circleci'}/project`;
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error getting the default workspace: ${e.message}`
    );

    return '';
  }
}

function getImageWithoutTag(image: string): string {
  const pattern = /([^:]+):[^\s]+$/;
  return image.match(pattern)
    ? (image.match(pattern) as Array<string>)[1]
    : image;
}
