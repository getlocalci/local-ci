import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../setup/binary.js';
import areAllTerminalsClosed from './areAllTerminalsClosed';
import cleanUpCommittedImage from './cleanUpCommittedImage';
import commitContainer from './commitContainer';
import getConfigFile from './getConfigFile';
import getDefaultWorkspace from './getDefaultWorkspace';
import getCheckoutDirectoryBasename from './getCheckoutDirectoryBasename';
import getCheckoutJobs from './getCheckoutJobs';
import getImageFromJob from './getImageFromJob';
import getRootPath from './getRootPath';
import processConfig from './processConfig';
import {
  GET_CONTAINER_FUNCTION,
  PROCESS_FILE_PATH,
  TMP_PATH,
} from '../constants';

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
    name: `local-ci debugging ${jobName}`,
    message: 'This is inside the running container',
  });
  const committedContainerBase = 'local-ci-';

  // Once the container is available, start an interactive bash session within the container.
  debuggingTerminal.sendText(`
    ${GET_CONTAINER_FUNCTION}
    until [[ -n $(get_container ${dockerImage}) ]]
    do
      sleep 2
    done
    echo "Inside the job's container:"
    docker exec -it $(get_container ${dockerImage}) /bin/sh || exit 1
  `);

  debuggingTerminal.show();
  commitContainer(dockerImage, `${committedContainerBase}${jobName}`);
  const interval = setInterval(
    () => commitContainer(dockerImage, `${committedContainerBase}${jobName}`),
    2000
  );
  const committedImageName = `${committedContainerBase}${jobName}`;

  let finalTerminal: vscode.Terminal | undefined;
  vscode.window.onDidCloseTerminal((closedTerminal) => {
    if (
      closedTerminal.name !== debuggingTerminal.name ||
      !closedTerminal?.exitStatus?.code
    ) {
      return;
    }

    clearTimeout(interval);
    finalTerminal = vscode.window.createTerminal({
      name: `local-ci final debugging ${jobName}`,
      message: 'Debug the final state of the container',
    });
    finalTerminal.sendText(
      `echo "Inside a similar container after the job's container exited:"`
    );

    // @todo: handle if debuggingTerminal exits because terminal hasn't started the container.
    finalTerminal.sendText(`docker run -it --rm ${committedImageName}`);
  });

  vscode.window.onDidCloseTerminal(() => {
    if (areAllTerminalsClosed(terminal, debuggingTerminal, finalTerminal)) {
      clearTimeout(interval);
      cleanUpCommittedImage(committedImageName);
    }
  });
}
