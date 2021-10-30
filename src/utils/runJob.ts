import * as fs from 'fs';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../node/binary.js';
import areTerminalsClosed from './areTerminalsClosed';
import cleanUpCommittedImages from './cleanUpCommittedImages';
import commitContainer from './commitContainer';
import getConfigFile from './getConfigFile';
import getConfigFilePath from './getConfigFilePath.js';
import getProjectDirectory from './getProjectDirectory';
import getCheckoutDirectoryBasename from './getCheckoutDirectoryBasename';
import getCheckoutJobs from './getCheckoutJobs';
import getDebuggingTerminalName from './getDebuggingTerminalName';
import getStorageDirectory from './getStorageDirectory';
import getImageFromJob from './getImageFromJob';
import showMainTerminalHelperMessages from './showMainTerminalHelperMessages';
import showFinalTerminalHelperMessages from './showFinalTerminalHelperMessages';
import {
  COMMITTED_IMAGE_NAMESPACE,
  GET_RUNNING_CONTAINER_FUNCTION,
} from '../constants';
import getFinalDebuggingTerminalName from './getFinalTerminalName';
import getLocalVolumePath from './getLocalVolumePath';
import getProcessFilePath from './getProcessFilePath';
import getTerminalName from './getTerminalName';
import getLatestCommittedImage from './getLatestCommittedImage';

export default async function runJob(
  context: vscode.ExtensionContext,
  jobName: string
): Promise<RunningTerminal[]> {
  const terminal = vscode.window.createTerminal({
    name: getTerminalName(jobName),
    message: `About to run the CircleCI® job ${jobName}…`,
    iconPath: vscode.Uri.joinPath(
      context.extensionUri,
      'resources',
      'logo.svg'
    ),
  });
  terminal.show();

  const processFilePath = getProcessFilePath(await getConfigFilePath(context));
  const checkoutJobs = getCheckoutJobs(processFilePath);
  const localVolume = getLocalVolumePath();

  // If this is the only checkout job, rm the entire local volume directory.
  // This job will checkout to that volume, and there could be an error
  // if it attempts to cp to it and the files exist.
  // @todo: fix ocasional permission denied error for deleting this file.
  if (checkoutJobs.includes(jobName) && 1 === checkoutJobs.length) {
    fs.rmSync(localVolume, { recursive: true, force: true });
  }

  const configFile = getConfigFile(processFilePath);
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

  const projectDirectory = await getProjectDirectory(dockerImage, terminal);
  const attachWorkspace =
    '.' === initialAttachWorkspace || !initialAttachWorkspace
      ? projectDirectory
      : initialAttachWorkspace;

  const volume = checkoutJobs.includes(jobName)
    ? `${localVolume}:${getStorageDirectory()}`
    : `${localVolume}/${await getCheckoutDirectoryBasename(
        processFilePath,
        terminal
      )}:${attachWorkspace}`;

  if (!fs.existsSync(localVolume)) {
    fs.mkdirSync(localVolume, { recursive: true });
  }

  terminal.sendText(
    `${getBinaryPath()} local execute --job ${jobName} --config ${processFilePath} --debug -v ${volume}`
  );

  showMainTerminalHelperMessages();
  const committedImageName = `${COMMITTED_IMAGE_NAMESPACE}/${jobName}`;
  commitContainer(dockerImage, committedImageName);

  const intervalId = setInterval(
    () => commitContainer(dockerImage, committedImageName),
    1000
  );

  const debuggingTerminal = vscode.window.createTerminal({
    name: getDebuggingTerminalName(jobName),
    message: 'This is inside the running container',
    iconPath: vscode.Uri.joinPath(
      context.extensionUri,
      'resources',
      'logo.svg'
    ),
  });

  // Once the container is available, start an interactive bash session within the container.
  debuggingTerminal.sendText(`
    ${GET_RUNNING_CONTAINER_FUNCTION}
    echo "Waiting for bash access to the running container… \n"
    until [[ -n $(get_running_container ${dockerImage}) ]]
    do
      sleep 1
    done
    echo "Inside the job's container:"
    docker exec -it ${
      projectDirectory !== 'project' ? '--workdir ' + projectDirectory : ''
    } $(get_running_container ${dockerImage}) /bin/sh || exit 1
  `);

  let finalTerminal: vscode.Terminal | undefined;
  vscode.window.onDidCloseTerminal(async (closedTerminal) => {
    if (
      closedTerminal.name !== debuggingTerminal.name ||
      !closedTerminal?.exitStatus?.code
    ) {
      return;
    }

    clearInterval(intervalId);
    if (finalTerminal || areTerminalsClosed(terminal, debuggingTerminal)) {
      return;
    }

    finalTerminal = vscode.window.createTerminal({
      name: getFinalDebuggingTerminalName(jobName),
      message: 'Debug the final state of the container',
      iconPath: vscode.Uri.joinPath(
        context.extensionUri,
        'resources',
        'logo.svg'
      ),
    });
    finalTerminal.sendText(
      `echo "Inside a similar container after the job's container exited: \n"`
    );

    const latestCommmittedImageId = await getLatestCommittedImage(
      committedImageName
    );
    // @todo: handle if debuggingTerminal exits because terminal hasn't started the container.
    finalTerminal.sendText(
      `docker run -it --rm -v ${volume} ${
        projectDirectory !== 'project' ? '--workdir ' + projectDirectory : ''
      } ${latestCommmittedImageId}`
    );
    finalTerminal.show();

    setTimeout(() => {
      showFinalTerminalHelperMessages(latestCommmittedImageId);
      cleanUpCommittedImages(committedImageName, latestCommmittedImageId);
    }, 4000);
  });

  vscode.window.onDidCloseTerminal(() => {
    if (areTerminalsClosed(terminal, debuggingTerminal, finalTerminal)) {
      clearInterval(intervalId);
      cleanUpCommittedImages(committedImageName);
    }
  });

  return [
    await terminal.processId,
    await debuggingTerminal.processId,
    finalTerminal ? await finalTerminal?.processId : finalTerminal,
  ];
}
