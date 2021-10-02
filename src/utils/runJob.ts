import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../node/binary.js';
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
  GET_RUNNING_CONTAINER_FUNCTION,
  PROCESS_FILE_PATH,
  TMP_PATH,
} from '../constants';

export default async function runJob(
  jobName: string,
  extensionUri: vscode.Uri
): Promise<(number | undefined)[]> {
  const terminal = vscode.window.createTerminal({
    name: `Local CI ${jobName}`,
    message: `Running the CircleCI® job ${jobName}`,
    iconPath: {
      light: vscode.Uri.joinPath(
        extensionUri,
        'resources',
        'light',
        'logo.svg'
      ),
      dark: vscode.Uri.joinPath(extensionUri, 'resources', 'dark', 'logo.svg'),
    },
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

  const debuggingTerminal = vscode.window.createTerminal({
    name: `Local CI debugging ${jobName}`,
    message: 'This is inside the running container',
    iconPath: new vscode.ThemeIcon('testing-debug-icon'),
  });

  // Once the container is available, start an interactive bash session within the container.
  debuggingTerminal.sendText(`
    ${GET_RUNNING_CONTAINER_FUNCTION}
    until [[ -n $(get_running_container ${dockerImage}) ]]
    do
      sleep 2
    done
    echo "Inside the job's container:"
    docker exec -it $(get_running_container ${dockerImage}) /bin/sh || exit 1
  `);
  debuggingTerminal.show();

  const committedImageName = `local-ci/${jobName}`;
  commitContainer(dockerImage, committedImageName);

  const interval = setInterval(() => {
    commitContainer(dockerImage, committedImageName);
  }, 2000);

  let finalTerminal: vscode.Terminal | undefined;
  vscode.window.onDidCloseTerminal((closedTerminal) => {
    if (
      closedTerminal.name !== debuggingTerminal.name ||
      !closedTerminal?.exitStatus?.code
    ) {
      return;
    }

    clearTimeout(interval);
    if (finalTerminal) {
      return;
    }

    finalTerminal = vscode.window.createTerminal({
      name: `Local CI final debugging ${jobName}`,
      message: 'Debug the final state of the container',
      iconPath: new vscode.ThemeIcon('testing-debug-icon'),
    });
    finalTerminal.sendText(
      `echo "Inside a similar container after the job's container exited:"`
    );

    // @todo: handle if debuggingTerminal exits because terminal hasn't started the container.
    finalTerminal.sendText(
      `docker run -it --rm $(docker images --filter reference=${committedImageName} -q | head -1)`
    );
  });

  vscode.window.onDidCloseTerminal(() => {
    if (areAllTerminalsClosed(terminal, debuggingTerminal, finalTerminal)) {
      clearTimeout(interval);
      cleanUpCommittedImage(committedImageName);
    }
  });

  return [
    await terminal.processId,
    await debuggingTerminal.processId,
    await finalTerminal?.processId,
  ];
}
