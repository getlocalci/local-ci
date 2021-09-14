import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../setup/binary.js';
import getConfigFile from './getConfigFile';
import getDefaultWorkspace from './getDefaultWorkspace';
import getCheckoutDirectoryBasename from './getCheckoutDirectoryBasename';
import getCheckoutJobs from './getCheckoutJobs';
import getImageFromJob from './getImageFromJob';
import getRootPath from './getRootPath';
import getSpawnOptions from './getSpawnOptions';
import processConfig from './processConfig';
import { PROCESS_FILE_PATH, TMP_PATH } from '../constants';

export default async function runJob(jobName: string): Promise<void> {
  const terminal = vscode.window.createTerminal({
    name: `local-ci ${jobName}`,
    message: `Running the CircleCI® job ${jobName}`,
  });

  processConfig();
  const checkoutJobs = getCheckoutJobs(PROCESS_FILE_PATH);
  const localVolume = `${TMP_PATH}/${path.basename(getRootPath())}`;

  // If this is the only checkout job, rm the entire local volume directory.
  // This job will checkout to that volume, and there could be an error
  // if it attempts to cp to it and the files exist.
  // @todo: fix ocasional permisison denied error for deleting this file.
  if (checkoutJobs.includes(jobName) && 1 === checkoutJobs.length) {
    fs.rmSync(localVolume, { recursive: true, force: true });
  }

  const configFile = getConfigFile(PROCESS_FILE_PATH);
  const attachWorkspaceSteps = configFile?.jobs[jobName]?.steps?.length
    ? (configFile?.jobs[jobName]?.steps as Array<Step>).filter((step) =>
        Boolean(step.attach_workspace)
      )
    : [];

  const dockerImage = getImageFromJob(configFile?.jobs[jobName]);
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
        PROCESS_FILE_PATH
      )}:${attachWorkspace}`;
  const debuggingTerminalName = `local-ci debugging ${jobName}`;
  const finalTerminalName = 'local-ci final terminal';

  if (!fs.existsSync(localVolume)) {
    fs.mkdirSync(localVolume);
  }

  terminal.sendText(
    `${getBinaryPath()} local execute --job ${jobName} --config ${PROCESS_FILE_PATH} --debug -v ${volume}`
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
  // @todo: makes this more robust.
  // Ideally, it'd use docker inspect to get the image.
  // But that hangs sometimes: https://github.com/docker/for-linux/issues/397
  const getContainerDefinition = `get_container() {
    IMAGE=$1
    docker ps --filter ancestor=$IMAGE --filter status=running -lq
  }`;

  // Once the container is available, start an interactive bash session within the container.
  debuggingTerminal.sendText(`
    ${getContainerDefinition}
    until [[ -n $(get_container ${dockerImage}) ]]
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
      // Remove the container and image that were copies of the running CircleCI® job container.
      const imageName = `${committedContainerBase}${jobName}`;
      cp.spawnSync(
        `${getContainerDefinition} docker rm -f $(get_container ${imageName})`,
        [],
        getSpawnOptions()
      );
    }
  });
}