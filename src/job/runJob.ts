import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../node/binary';
import areTerminalsClosed from 'terminal/areTerminalsClosed';
import cleanUpCommittedImages from 'containerization/cleanUpCommittedImages';
import commitContainer from 'containerization/commitContainer';
import getCheckoutJobs from './getCheckoutJobs';
import getConfigFilePath from 'config/getConfigFilePath';
import getConfigFromPath from 'config/getConfigFromPath';
import getDebuggingTerminalName from 'terminal/getDebuggingTerminalName';
import getFinalDebuggingTerminalName from 'terminal/getFinalTerminalName';
import getLogFilePath from 'log/getLogFilePath';
import getImageFromJob from 'containerization/getImageFromJob';
import getLatestCommittedImage from 'containerization/getLatestCommittedImage';
import getLocalVolumePath from 'containerization/getLocalVolumePath';
import getProcessFilePath from 'process/getProcessFilePath';
import getTerminalName from 'terminal/getTerminalName';
import listenToJob from './listenToJob';
import setBuildAgentSettings from 'config/setBuildAgentSettings';
import showFinalTerminalHelperMessages from 'terminal/showFinalTerminalHelperMessages';
import JobClass from 'job/Job';
import {
  COMMITTED_IMAGE_NAMESPACE,
  CONTAINER_STORAGE_DIRECTORY,
  CONTINUE_PIPELINE_STEP_NAME,
} from 'constants/';
import uncommittedWarning from '../containerization/uncommittedWarning';
import getDynamicConfigPath from 'config/getDynamicConfigPath';
import JobProvider from 'job/JobProvider';
import { GET_RUNNING_CONTAINER_FUNCTION } from 'constants/';

/** Whether this job creates a dynamic config: https://circleci.com/docs/2.0/dynamic-config/ */
function doesJobCreateDynamicConfig(job: Job | undefined): boolean {
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
  jobProvider: JobProvider,
  job: JobClass | undefined
): Promise<void> {
  if (job && job instanceof JobClass) {
    job.setIsRunning();
    await jobProvider.hardRefresh(job);
  }

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

  const dynamicConfigFilePath = getDynamicConfigPath(configFilePath);
  const parsedDynamicConfigFile = getConfigFromPath(dynamicConfigFilePath);
  const checkoutJobs = getCheckoutJobs(parsedProcessFile);
  const localVolume = getLocalVolumePath(configFilePath);
  let jobInConfig = parsedProcessFile?.jobs
    ? parsedProcessFile?.jobs[jobName]
    : undefined;
  const isJobInDynamicConfig =
    !!parsedDynamicConfigFile?.jobs && !!parsedDynamicConfigFile?.jobs[jobName];

  // If there's a dynamic config, this should look for the job in
  // the generated dynamic config file.
  // https://circleci.com/docs/2.0/dynamic-config/
  if (!jobInConfig && isJobInDynamicConfig && parsedDynamicConfigFile?.jobs) {
    jobInConfig = parsedDynamicConfigFile?.jobs[jobName];
  }

  uncommittedWarning(context, repoPath, jobName, checkoutJobs);
  setBuildAgentSettings();

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
  const jobConfigPath = isJobInDynamicConfig
    ? dynamicConfigFilePath
    : processFilePath;

  terminal.sendText(
    `cat ${jobConfigPath} | docker run -i --rm mikefarah/yq -C
    ${getBinaryPath()} local execute --job '${jobName}' --config ${jobConfigPath} -v ${volume}`
  );

  const committedImageRepo = `${COMMITTED_IMAGE_NAMESPACE}/${jobName}`;

  const jobImage = getImageFromJob(jobInConfig);
  const commitProcess = commitContainer(jobImage, committedImageRepo);

  const logFilePath = getLogFilePath(configFilePath, jobName);
  if (!fs.existsSync(path.dirname(logFilePath))) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  }

  const listeningProcess = listenToJob(
    context,
    jobProvider,
    job,
    commitProcess,
    doesJobCreateDynamicConfig(jobInConfig),
    jobConfigPath,
    logFilePath
  );

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
    printf "You'll get bash access to the job once this conditional is true:\n"
    until [ -n "$(get_running_container "${jobImage}")" ]
      do
      sleep 1
    done
    echo "Inside the job's container:"
    docker exec -it "$(get_running_container "${jobImage}")" /bin/sh || exit 1
    `);
  debuggingTerminal.sendText('cd ~/');

  let finalTerminal: vscode.Terminal;
  vscode.window.onDidCloseTerminal((closedTerminal) => {
    const terminalNames = [
      getTerminalName(jobName),
      debuggingTerminal.name,
      finalTerminal?.name,
    ];

    if (terminalNames.includes(closedTerminal.name)) {
      commitProcess.kill();
    }
  });

  vscode.window.onDidCloseTerminal(async (closedTerminal) => {
    if (
      closedTerminal.name !== debuggingTerminal.name ||
      !closedTerminal?.exitStatus?.code
    ) {
      return;
    }

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
      listeningProcess.kill();
      cleanUpCommittedImages(committedImageRepo);
    }
  });
}
