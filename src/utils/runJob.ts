import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../node/binary.js';
import areTerminalsClosed from './areTerminalsClosed';
import cleanUpCommittedImages from './cleanUpCommittedImages';
import commitContainer from './commitContainer';
import convertHomeDirToAbsolute from './convertHomeDirToAbsolute';
import getConfigFilePath from './getConfigFilePath';
import getConfigFromPath from './getConfigFromPath';
import getCheckoutJobs from './getCheckoutJobs';
import getDebuggingTerminalName from './getDebuggingTerminalName';
import getFinalDebuggingTerminalName from './getFinalTerminalName';
import getHomeDirectory from './getHomeDirectory';
import getImageFromJob from './getImageFromJob';
import getLatestCommittedImage from './getLatestCommittedImage';
import getLocalVolumePath from './getLocalVolumePath';
import getPersistToWorkspaceBasename from './getPersistToWorkspaceBasename';
import getProcessFilePath from './getProcessFilePath';
import getTerminalName from './getTerminalName';
import getWorkingDirectory from './getWorkingDirectory';
import showMainTerminalHelperMessages from './showMainTerminalHelperMessages';
import showFinalTerminalHelperMessages from './showFinalTerminalHelperMessages';
import {
  COMMITTED_IMAGE_NAMESPACE,
  GET_RUNNING_CONTAINER_FUNCTION,
  CONTAINER_STORAGE_DIRECTORY,
} from '../constants';

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
  const config = getConfigFromPath(processFilePath);
  const checkoutJobs = getCheckoutJobs(config);
  const localVolume = getLocalVolumePath(configFilePath);

  // If this is the only checkout job, rm the entire local volume directory.
  // This job will checkout to that volume, and there could be an error
  // if it attempts to cp to it and the files exist.
  if (checkoutJobs.includes(jobName) && 1 === checkoutJobs.length) {
    fs.rmSync(localVolume, { recursive: true, force: true });
  }

  const attachWorkspaceSteps: FullStep[] = config?.jobs[jobName]?.steps?.length
    ? (config?.jobs[jobName]?.steps as Array<FullStep>).filter(
        (step) => !!step?.attach_workspace
      )
    : [];

  const jobImage = getImageFromJob(config?.jobs[jobName]);
  const initialAttachWorkspace =
    attachWorkspaceSteps.length && attachWorkspaceSteps[0]?.attach_workspace?.at
      ? attachWorkspaceSteps[0]?.attach_workspace.at
      : '';

  const homeDir = await getHomeDirectory(jobImage, terminal);
  const attachWorkspace =
    '.' === initialAttachWorkspace || !initialAttachWorkspace
      ? await getWorkingDirectory(
          jobImage,
          config?.jobs[jobName] as Job,
          terminal
        )
      : initialAttachWorkspace;

  const volume = checkoutJobs.includes(jobName)
    ? `${localVolume}:${convertHomeDirToAbsolute(
        initialAttachWorkspace || CONTAINER_STORAGE_DIRECTORY,
        homeDir
      )}`
    : `${path.join(
        localVolume,
        await getPersistToWorkspaceBasename(config, terminal)
      )}:${convertHomeDirToAbsolute(attachWorkspace, homeDir)}`;

  if (!fs.existsSync(localVolume)) {
    fs.mkdirSync(localVolume, { recursive: true });
  }

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
