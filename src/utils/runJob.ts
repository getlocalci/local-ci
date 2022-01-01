import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../node/binary';
import areTerminalsClosed from './areTerminalsClosed';
import cleanUpCommittedImages from './cleanUpCommittedImages';
import commitContainer from './commitContainer';
import getCheckoutJobs from './getCheckoutJobs';
import getConfigFilePath from './getConfigFilePath';
import getConfigFromPath from './getConfigFromPath';
import getDebuggingTerminalName from './getDebuggingTerminalName';
import getFinalDebuggingTerminalName from './getFinalTerminalName';
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
  CONTINUE_PIPELINE_STEP_NAME,
} from '../constants';
import uncommittedWarning from './uncommittedWarning';
import getDynamicConfigFilePath from './getDynamicConfigFilePath';
import JobProvider from '../classes/JobProvider';

// Whether this job creates a dynamic config: https://circleci.com/docs/2.0/dynamic-config/
function doesJobCreateDynamicConfig(job: Job | undefined) {
  return (
    !!job?.steps &&
    job?.steps.some(
      (step) =>
        typeof step !== 'string' &&
        typeof step.run !== 'string' &&
        CONTINUE_PIPELINE_STEP_NAME === step?.run?.name
    )
  );
}

export default async function runJob(
  context: vscode.ExtensionContext,
  jobName: string,
  jobProvider: JobProvider
): Promise<void> {
  const configFilePath = await getConfigFilePath(context);
  const repoPath = path.dirname(path.dirname(configFilePath));
  const terminal = vscode.window.createTerminal({
    name: getTerminalName(jobName),
    message: `Running the CircleCI® job ${jobName}…`,
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

  // If there's a dynamic config, this should look for the job in
  // the generated dynamic config file.
  // https://circleci.com/docs/2.0/dynamic-config/
  const dynamicConfigFilePath = getDynamicConfigFilePath(configFilePath);
  const parsedDynamicConfigFile = getConfigFromPath(dynamicConfigFilePath);
  const checkoutJobs = getCheckoutJobs(parsedProcessFile);
  const localVolume = getLocalVolumePath(configFilePath);
  let job = parsedProcessFile?.jobs[jobName];
  const isJobInDynamicConfig =
    !!parsedDynamicConfigFile && !!parsedDynamicConfigFile?.jobs[jobName];

  if (!job && isJobInDynamicConfig) {
    job = parsedDynamicConfigFile?.jobs[jobName];
  }

  uncommittedWarning(context, repoPath, jobName, checkoutJobs);

  // If this is the only checkout job, it's probably at the beginning of the workflow.
  // So delete the local volume directory to give a clean start to the workflow,
  // without files saved from any previous run.
  if (checkoutJobs.includes(jobName) && 1 === checkoutJobs.length) {
    fs.rmSync(localVolume, { recursive: true, force: true });
  }

  if (!fs.existsSync(localVolume)) {
    fs.mkdirSync(localVolume, { recursive: true });
  }

  // This allows persisting files between jobs with persist_to_workspace and attach_workspace.
  const volume = `${localVolume}:${CONTAINER_STORAGE_DIRECTORY}`;

  // @todo: maybe don't have a volume at all if there's no persist_to_workspace or attach_workspace.
  terminal.sendText(
    `${getBinaryPath()} local execute --job ${jobName} --config ${
      isJobInDynamicConfig ? dynamicConfigFilePath : processFilePath
    } --debug -v ${volume}`
  );

  const helperMessagesProcess = showMainTerminalHelperMessages(
    jobProvider,
    doesJobCreateDynamicConfig(job)
  );
  const committedImageRepo = `${COMMITTED_IMAGE_NAMESPACE}/${jobName}`;

  const jobImage = getImageFromJob(job);
  const commitProcess = commitContainer(jobImage, committedImageRepo);

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

  // Once the container is available, run an interactive bash shell within the container.
  debuggingTerminal.sendText(`
    ${GET_RUNNING_CONTAINER_FUNCTION}
    echo "You'll get bash access to the job once this conditional is true:\n"
    until [[ -n $(get_running_container ${jobImage}) ]]
    do
      sleep 1
    done
    echo "Inside the job's container:"
    docker exec -it $(get_running_container ${jobImage}) /bin/sh || exit 1`);
  debuggingTerminal.sendText('cd ~/');

  let finalTerminal: vscode.Terminal;
  vscode.window.onDidCloseTerminal(async (closedTerminal) => {
    if (
      closedTerminal.name !== debuggingTerminal.name ||
      !closedTerminal?.exitStatus?.code
    ) {
      return;
    }

    commitProcess.kill();
    if (finalTerminal || areTerminalsClosed(terminal, debuggingTerminal)) {
      return;
    }

    const latestCommmittedImageId = await getLatestCommittedImage(
      committedImageRepo
    );

    setTimeout(
      () => showFinalTerminalHelperMessages(latestCommmittedImageId),
      4000
    );

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
        docker run -it --rm -v ${volume} $(docker images ${committedImageRepo} --format "{{.ID}} {{.Tag}}" | sort -k 2 -h | tail -n1 | awk '{print $1}')`
      );

      finalTerminal.sendText('cd ~/');
      finalTerminal.show();
    }
  });

  vscode.window.onDidCloseTerminal(() => {
    if (areTerminalsClosed(terminal, debuggingTerminal, finalTerminal)) {
      commitProcess.kill();
      helperMessagesProcess.kill();
      cleanUpCommittedImages(committedImageRepo);
    }
  });
}
