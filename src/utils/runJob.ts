import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../node/binary.js';
import areTerminalsClosed from './areTerminalsClosed';
import cleanUpCommittedImages from './cleanUpCommittedImages';
import commitContainer from './commitContainer';
import getConfigFilePath from './getConfigFilePath';
import getConfigFromPath from './getConfigFromPath';
import getCheckoutJobs from './getCheckoutJobs';
import getDebuggingTerminalName from './getDebuggingTerminalName';
import getFinalDebuggingTerminalName from './getFinalTerminalName';
import getHomeDirectory from './getHomeDirectory';
import getImageFromJob from './getImageFromJob';
import getLatestCommittedImage from './getLatestCommittedImage';
import getLocalVolumePath from './getLocalVolumePath';
import getProcessFilePath from './getProcessFilePath';
import getTerminalName from './getTerminalName';
import showMainTerminalHelperMessages from './showMainTerminalHelperMessages';
import showFinalTerminalHelperMessages from './showFinalTerminalHelperMessages';
import {
  GET_RUNNING_CONTAINER_FUNCTION,
  COMMITTED_IMAGE_NAMESPACE,
  CONTAINER_STORAGE_DIRECTORY,
} from '../constants';
import normalizeDirectory from './normalizeDirectory';

export default async function runJob(
  context: vscode.ExtensionContext,
  jobName: string
): Promise<void> {
  const configFilePath = await getConfigFilePath(context);
  const repoPath = path.dirname(path.dirname(configFilePath));
  const terminal = vscode.window.createTerminal({
    name: getTerminalName(jobName),
    message: `About to run the CircleCI® job ${jobName}…`,
    iconPath: vscode.Uri.joinPath(
      context.extensionUri,
      'resources',
      'logo.svg'
    ),
    cwd: repoPath,
  });
  terminal.show();

  const processFilePath = getProcessFilePath(configFilePath);
  const parsedProcessFile = getConfigFromPath(processFilePath);
  const checkoutJobs = getCheckoutJobs(parsedProcessFile);
  const localVolume = getLocalVolumePath(configFilePath);
  const job = parsedProcessFile?.jobs[jobName];

  // If this is the only checkout job, rm the entire local volume directory.
  // This job will checkout to that volume, and there could be an error
  // if it attempts to cp to it and the files exist.
  if (checkoutJobs.includes(jobName) && 1 === checkoutJobs.length) {
    fs.rmSync(localVolume, { recursive: true, force: true });
  }

  const attachWorkspaceSteps: FullStep[] = job?.steps?.length
    ? (job?.steps as Array<FullStep>).filter((step) => !!step?.attach_workspace)
    : [];

  const attachWorkspaceAt =
    attachWorkspaceSteps.length && attachWorkspaceSteps[0]?.attach_workspace?.at
      ? attachWorkspaceSteps[0]?.attach_workspace.at
      : '';

  const jobImage = getImageFromJob(job);
  const homeDir = await getHomeDirectory(jobImage, terminal);

  // Jobs with no attach_workspace often need a different volume path.
  // If they use the working_directory as the volume path,
  // There's usually an error if they checkout:
  // Error: Directory (/home/circleci/foo) you are trying to checkout to is not empty and not a git repository.
  const volume = `${localVolume}:${normalizeDirectory(
    attachWorkspaceAt || CONTAINER_STORAGE_DIRECTORY,
    homeDir,
    job
  )}`;

  if (!fs.existsSync(localVolume)) {
    fs.mkdirSync(localVolume, { recursive: true });
  }

  // @todo: maybe don't have a volume at all if there's no persist_to_workspace or attach_workspace.
  terminal.sendText(
    `${getBinaryPath()} local execute --job ${jobName} --config ${processFilePath} --debug -v ${volume}`
  );

  showMainTerminalHelperMessages();
  const committedImageRepo = `${COMMITTED_IMAGE_NAMESPACE}/${jobName}`;

  commitContainer(jobImage, committedImageRepo);

  const intervalId = setInterval(() => {
    commitContainer(jobImage, committedImageRepo);
  }, 2000);

  const debuggingTerminal = vscode.window.createTerminal({
    name: getDebuggingTerminalName(jobName),
    message: 'This is inside the running container',
    iconPath: vscode.Uri.joinPath(
      context.extensionUri,
      'resources',
      'logo.svg'
    ),
    cwd: repoPath,
  });

  // Once the container is available, start an interactive bash session within the container.
  debuggingTerminal.sendText(`
    ${GET_RUNNING_CONTAINER_FUNCTION}
    echo "You'll get bash access to the job once this conditional is true:\n"
    until [[ -n $(get_running_container ${jobImage}) ]]
    do
      sleep 1
    done
    echo "Inside the job's container:"
    docker exec -it --workdir ${homeDir} $(get_running_container ${jobImage}) /bin/sh || exit 1
  `);

  let finalTerminal: vscode.Terminal;
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

    const latestCommmittedImageId = await getLatestCommittedImage(
      committedImageRepo
    );

    setTimeout(() => {
      showFinalTerminalHelperMessages(latestCommmittedImageId);
      cleanUpCommittedImages(committedImageRepo, latestCommmittedImageId);
    }, 4000);

    if (latestCommmittedImageId) {
      finalTerminal = vscode.window.createTerminal({
        name: getFinalDebuggingTerminalName(jobName),
        message: 'Debug the final state of the container',
        iconPath: vscode.Uri.joinPath(
          context.extensionUri,
          'resources',
          'logo.svg'
        ),
        cwd: repoPath,
      });

      finalTerminal.sendText(
        `echo "Inside a similar container after the job's container exited: \n"
        docker run -it --rm -v ${volume} --workdir ${homeDir} ${latestCommmittedImageId}`
      );
      finalTerminal.show();
    }
  });

  vscode.window.onDidCloseTerminal(() => {
    if (areTerminalsClosed(terminal, debuggingTerminal, finalTerminal)) {
      clearInterval(intervalId);
      cleanUpCommittedImages(committedImageRepo);
    }
  });
}
