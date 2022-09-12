import * as path from 'path';
import * as fs from 'fs';
import type vscode from 'vscode';
import { getBinaryPath } from '../../node/binary';
import areTerminalsClosed from 'terminal/areTerminalsClosed';
import getCheckoutJobs from './getCheckoutJobs';
import getDebuggingTerminalName from 'terminal/getDebuggingTerminalName';
import getFinalDebuggingTerminalName from 'terminal/getFinalTerminalName';
import getLogFilePath from 'log/getLogFilePath';
import getImageFromJob from 'containerization/getImageFromJob';
import LatestCommittedImage from 'containerization/LatestCommittedImage';
import getLocalVolumePath from 'containerization/getLocalVolumePath';
import getProcessFilePath from 'process/getProcessFilePath';
import getTerminalName from 'terminal/getTerminalName';
import JobListener from './JobListener';
import {
  COMMITTED_IMAGE_NAMESPACE,
  CONTAINER_STORAGE_DIRECTORY,
  CONTINUE_PIPELINE_STEP_NAME,
} from 'constants/';
import getDynamicConfigPath from 'config/getDynamicConfigPath';
import JobProvider from 'job/JobProvider';
import {
  dockerExecRunningContainer,
  getRunningContainerFunction,
} from 'scripts/';
import ConfigFile from 'config/ConfigFile';
import { inject } from 'inversify';
import JobFactory from 'job/JobFactory';
import ParsedConfig from 'config/ParsedConfig';
import FinalTerminal from 'terminal/FinalTerminal';
import CommittedImages from 'containerization/CommittedImages';
import UncommittedFile from '../containerization/UncommittedFile';
import BuildAgentSettings from 'config/BuildAgentSettings';
import Types from 'common/Types';
import EditorGateway from 'common/EditorGateway';
import RunningContainer from 'containerization/RunningContainer';
import JobTreeItem from './JobTreeItem';

export default class JobRunner {
  @inject(BuildAgentSettings)
  buildAgentSettings!: BuildAgentSettings;

  @inject(CommittedImages)
  committedImages!: CommittedImages;

  @inject(ConfigFile)
  configFile!: ConfigFile;

  @inject(RunningContainer)
  runningContainer!: RunningContainer;

  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(FinalTerminal)
  finalTerminal!: FinalTerminal;

  @inject(JobFactory)
  jobFactory!: JobFactory;

  @inject(JobListener)
  jobListener!: JobListener;

  @inject(LatestCommittedImage)
  latestCommittedImage!: LatestCommittedImage;

  @inject(ParsedConfig)
  parsedConfig!: ParsedConfig;

  @inject(UncommittedFile)
  uncommittedFile!: UncommittedFile;

  async run(
    context: vscode.ExtensionContext,
    jobName: string,
    jobProvider: JobProvider,
    job: JobTreeItem | undefined
  ): Promise<void> {
    if (job && job instanceof JobTreeItem) {
      job.setIsRunning();
      await jobProvider.hardRefresh(job);
    }

    const configFilePath = await this.configFile.getPath(context);
    const repoPath = path.dirname(path.dirname(configFilePath));
    const terminal = this.editorGateway.editor.window.createTerminal({
      name: getTerminalName(jobName),
      message: `Running the CircleCI® job ${jobName}…`,
      iconPath: this.editorGateway.editor.Uri.joinPath(
        context.extensionUri,
        'resources',
        'logo.svg'
      ),
      cwd: repoPath,
    });
    terminal.show();

    const processFilePath = getProcessFilePath(configFilePath);
    const parsedProcessFile = this.parsedConfig.get(processFilePath);

    const dynamicConfigFilePath = getDynamicConfigPath(configFilePath);
    const parsedDynamicConfigFile = this.parsedConfig.get(
      dynamicConfigFilePath
    );
    const checkoutJobs = getCheckoutJobs(parsedProcessFile);
    const localVolume = getLocalVolumePath(configFilePath);
    let jobInConfig = parsedProcessFile?.jobs
      ? parsedProcessFile?.jobs[jobName]
      : undefined;
    const isJobInDynamicConfig =
      !!parsedDynamicConfigFile?.jobs &&
      !!parsedDynamicConfigFile?.jobs[jobName];

    // If there's a dynamic config, this should look for the job in
    // the generated dynamic config file.
    // https://circleci.com/docs/2.0/dynamic-config/
    if (!jobInConfig && isJobInDynamicConfig && parsedDynamicConfigFile?.jobs) {
      jobInConfig = parsedDynamicConfigFile?.jobs[jobName];
    }

    this.uncommittedFile.warn(context, repoPath, jobName, checkoutJobs);
    this.buildAgentSettings.set();

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
    const commitProcess = this.runningContainer.commit(
      jobImage,
      committedImageRepo
    );

    const logFilePath = getLogFilePath(configFilePath, jobName);
    if (!fs.existsSync(path.dirname(logFilePath))) {
      fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }

    const listeningProcess = this.jobListener.listen(
      context,
      jobProvider,
      job,
      commitProcess,
      this.doesJobCreateDynamicConfig(jobInConfig),
      jobConfigPath,
      logFilePath
    );

    const debuggingTerminal = this.editorGateway.editor.window.createTerminal({
      name: getDebuggingTerminalName(jobName),
      message: 'This is inside the running container',
      iconPath: this.editorGateway.editor.Uri.joinPath(
        context.extensionUri,
        'resources',
        'logo.svg'
      ),
      cwd: repoPath,
    });

    // Once the container is available, run an interactive bash shell within the container.
    debuggingTerminal.sendText(`
      ${getRunningContainerFunction}
      LCI_JOB_IMAGE=${jobImage}
      ${dockerExecRunningContainer}`);
    debuggingTerminal.sendText('cd ~/');

    let finalTerminal: vscode.Terminal;
    this.editorGateway.editor.window.onDidCloseTerminal((closedTerminal) => {
      const terminalNames = [
        getTerminalName(jobName),
        debuggingTerminal.name,
        finalTerminal?.name,
      ];

      if (terminalNames.includes(closedTerminal.name)) {
        commitProcess.kill();
      }
    });

    this.editorGateway.editor.window.onDidCloseTerminal(
      async (closedTerminal) => {
        if (
          closedTerminal.name !== debuggingTerminal.name ||
          !closedTerminal?.exitStatus?.code
        ) {
          return;
        }

        if (finalTerminal || areTerminalsClosed(terminal, debuggingTerminal)) {
          return;
        }

        const latestCommmittedImageId = await this.latestCommittedImage.get(
          committedImageRepo
        );

        setTimeout(
          () => this.finalTerminal.showHelperMessages(latestCommmittedImageId),
          4000
        );

        if (latestCommmittedImageId) {
          finalTerminal = this.editorGateway.editor.window.createTerminal({
            name: getFinalDebuggingTerminalName(jobName),
            message: 'Debug the final state of the container',
            iconPath: this.editorGateway.editor.Uri.joinPath(
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
      }
    );

    this.editorGateway.editor.window.onDidCloseTerminal(() => {
      if (areTerminalsClosed(terminal, debuggingTerminal, finalTerminal)) {
        listeningProcess.kill();
        this.committedImages.cleanUp(committedImageRepo);
      }
    });
  }

  /** Whether this job creates a dynamic config: https://circleci.com/docs/2.0/dynamic-config/ */
  doesJobCreateDynamicConfig(job: Job | undefined): boolean {
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
}
