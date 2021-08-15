import { execSync } from 'child_process';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as vscode from 'vscode';

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

export function getConfigFile(configFilePath = ''): ConfigFile {
  const configFile = yaml.load(fs.readFileSync(configFilePath, 'utf8'));
  if (!(configFile as ConfigFile)?.jobs) {
    throw new Error('No jobs found in config file');
  }

  return configFile as ConfigFile;
}

export function getJobs(configFilePath = ''): string[] | [] {
  return Object.keys(getConfigFile(configFilePath)?.jobs ?? {});
}

export function getCheckoutJobs(inputFile = ''): string[] {
  const configFile = getConfigFile(inputFile);

  return Object.keys(configFile?.jobs ?? []).filter((jobName) =>
    configFile.jobs[jobName]?.steps?.some(
      (step) => 'checkout' === step || step.checkout
    )
  );
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

  const pathMatches =
    !persistToWorkspacePath || persistToWorkspacePath === '.'
      ? pathBase.match(/[^/]+$/)
      : persistToWorkspacePath.match(/[^/]+$/);

  return pathMatches ? pathMatches[0] : '';
}

export function changeCheckoutJob(processFile: string): void {
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

export function getRootPath(): string {
  return vscode.workspace?.workspaceFolders?.length
    ? vscode.workspace.workspaceFolders[0]?.uri?.path
    : '';
}

export async function runJob(jobName: string): Promise<void> {
  if (!isDockerDaemonAvailable()) {
    vscode.window.showErrorMessage(`Please open Docker Desktop`);
    return;
  }

  const processFile = 'process.yml';

  const terminal = vscode.window.createTerminal({
    name: `local-ci ${jobName}`,
    message: `Running the CircleCI job ${jobName}`,
  });

  const tmpPath = '/tmp/local-ci';
  const configFileName = '.circleci/config.yml';
  const checkoutJobs = getCheckoutJobs(`${getRootPath()}/${configFileName}`);

  // If this is the only job with a checkout, rm the tmp/ directory for this repo.
  // If there are files there from another run, they will probably cause an error
  // When attempting to overwrite them.
  if (checkoutJobs.includes(jobName) && checkoutJobs.length === 1) {
    execSync(`rm -rf ${tmpPath}/${getDirectoryBasename()}`);
  }

  try {
    execSync(`rm -f ${tmpPath}/${processFile}`);
    execSync(
      `circleci config process ${getRootPath()}/${configFileName} > ${tmpPath}/${processFile}`
    );
    changeCheckoutJob(`${tmpPath}/${processFile}`);
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error processing the CircleCI config: ${e.message}`
    );
  }

  const directory = getDirectoryBasename();

  const configFile = getConfigFile(`${tmpPath}/${processFile}`);
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

  const localVolume = `${tmpPath}/${directory}`;
  const volume = checkoutJobs.includes(jobName)
    ? `${localVolume}:/${getHomeDirectory(dockerImage)}`
    : `${localVolume}/${getCheckoutDirectoryBasename(
        `${tmpPath}/${processFile}`
      )}:${attachWorkspace}`;
  const debuggingTerminalName = `local-ci debugging ${jobName}`;
  const finalTerminalName = 'local-ci final terminal';

  execSync(`mkdir -p ${localVolume}`);
  terminal.sendText(
    `circleci local execute --job ${jobName} --config ${tmpPath}/${processFile} --debug -v ${volume}`
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

  // Once the container is available, start an interactive bash session within the container.
  debuggingTerminal.sendText(`
    get_container() {
      IMAGE=$1
      for container in $(docker ps -q)
      do
        if [[ $(docker inspect --format='{{.Config.Image}}' $container) == $IMAGE ]]; then
          return $container
        fi
      done
    }

    # @todo: this might be wrong. It might only be doing docker inspect for one image.
    until [[ -n $(docker ps -q) && $(docker inspect -f '{{ .Config.Image}}' $(docker ps -q) | grep ${dockerImage}) ]]
    do
      sleep 2
    done
    echo "Inside the job's container:"
    # @todo: check to see there is a container
    docker exec -it get_container(${dockerImage}) /bin/sh || exit 1
  `);

  debuggingTerminal.show();

  const finalTerminal = vscode.window.createTerminal({
    name: finalTerminalName,
    message: 'Debug the final state of the container',
    hideFromUser: true,
  });

  function commitContainer(): void {
    // @todo: only commit this if get_container() returns an image.
    finalTerminal.sendText(
      `docker commit $(get_container ${dockerImage}) ${committedContainerBase}${jobName})`
    );
  }

  // Commit the latest container so that this can open an interactive session when it finishes.
  // Containers exit when they finish.
  // So this creates an alternative container for shell access.
  commitContainer();
  const interval = setInterval(commitContainer, 5000);

  vscode.window.onDidCloseTerminal((closedTerminal) => {
    clearTimeout(interval);

    if (
      closedTerminal.name === debuggingTerminalName &&
      closedTerminal?.exitStatus?.code
    ) {
      finalTerminal.sendText(
        `echo "Inside a similar container after the job's container exited:"`
      );

      // @todo: handle if debuggingTerminal exits because terminal hasn't started the container.
      finalTerminal.sendText(
        `docker run -it --rm ${committedContainerBase}${jobName}`
      );

      finalTerminal.show();
    } else if (closedTerminal.name === finalTerminalName) {
      // Remove the container and image that were copies of the running CircleCI job container.
      const imageName = `${committedContainerBase}${jobName}`;
      execSync(
        `docker rm -f get_container(${imageName})
        docker rmi -f ${imageName}`
      );
    }
  });
}

/**
 * Gets the basename of the directory.
 *
 * If the directory is 'example/foo/bar/',
 * The basename will be 'bar'.
 *
 * @returns {string} The basename of the directory.
 */
export function getDirectoryBasename(): string {
  const directoryMatches = getRootPath().match(/[^/]+$/);
  return directoryMatches ? directoryMatches[0] : '';
}

/** Gets the directory in /home/ that the job uses, like /home/circleci/. */
export function getHomeDirectory(imageName: string): string {
  try {
    execSync(
      `if [[ -z $(docker image ls | grep ${imageName}) ]]; then
        docker image pull ${imageName}
      fi`
    );

    const stdout = execSync(
      `docker image inspect ${imageName} --format='{{.Config.User}}'`
    );
    const userName = stdout.toString().trim() || 'circleci';

    return `/home/${userName}`;
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error getting the default workspace: ${e.message}`
    );

    return '';
  }
}

export function getDefaultWorkspace(imageName: string): string {
  const homeDirectory = getHomeDirectory(imageName);
  return homeDirectory ? `${homeDirectory}/project` : '';
}

export function isDockerDaemonAvailable(): boolean {
  try {
    execSync(`docker ps`);
    return true;
  } catch (e) {
    return false;
  }
}
