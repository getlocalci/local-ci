import * as path from 'path';
import type vscode from 'vscode';
import { getBinaryPath } from '../../node/binary';
import areTerminalsClosed from 'terminal/areTerminalsClosed';
import BuildAgentSettings from 'config/BuildAgentSettings';
import CommandDecorators from 'terminal/CommandDecorators';
import ConfigFile from 'config/ConfigFile';
import EditorGateway from 'gateway/EditorGateway';
import FinalTerminal from 'terminal/FinalTerminal';
import FsGateway from 'gateway/FsGateway';
import getCheckoutJobs from './getCheckoutJobs';
import getDebuggingTerminalName from 'terminal/getDebuggingTerminalName';
import getDynamicConfigProcessFilePath from 'process/getDynamicConfigProcessFilePath';
import getFinalDebuggingTerminalName from 'terminal/getFinalTerminalName';
import getImageFromJob from 'containerization/getImageFromJob';
import getLogFilePath from 'log/getLogFilePath';
import getLocalVolumePath from 'containerization/getLocalVolumePath';
import getProcessFilePath from 'process/getProcessFilePath';
import getRepoPath from 'common/getRepoPath';
import getTerminalName from 'terminal/getTerminalName';
import Images from 'containerization/Images';
import JobFactory from 'job/JobFactory';
import JobListener from './JobListener';
import JobProvider from 'job/JobProvider';
import JobTreeItem from './JobTreeItem';
import LatestCommittedImage from 'containerization/LatestCommittedImage';
import ParsedConfig from 'config/ParsedConfig';
import RunningContainer from 'containerization/RunningContainer';
import UncommittedFile from '../containerization/UncommittedFile';
import {
  COMMITTED_IMAGE_NAMESPACE,
  CONTAINER_STORAGE_DIRECTORY,
  CONTINUE_PIPELINE_STEP_NAME,
} from 'constant';
import {
  dockerExecRunningContainer,
  getRunningContainerFunction,
} from 'script';

export default class JobRunner {
  constructor(
    public buildAgentSettings: BuildAgentSettings,
    public commandDecorators: CommandDecorators,
    public configFile: ConfigFile,
    public editorGateway: EditorGateway,
    public finalTerminal: FinalTerminal,
    public fsGateway: FsGateway,
    public images: Images,
    public jobFactory: JobFactory,
    public jobListener: JobListener,
    public latestCommittedImage: LatestCommittedImage,
    public parsedConfig: ParsedConfig,
    public runningContainer: RunningContainer,
    public uncommittedFile: UncommittedFile
  ) {}

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
    const repoPath = getRepoPath(configFilePath);
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

    const dynamicConfigFilePath =
      getDynamicConfigProcessFilePath(configFilePath);
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
      this.fsGateway.fs.rmSync(localVolume, { recursive: true, force: true });
    }

    if (!this.fsGateway.fs.existsSync(localVolume)) {
      this.fsGateway.fs.mkdirSync(localVolume, { recursive: true });
    }

    // This allows persisting files between jobs with persist_to_workspace and attach_workspace, and caching.
    const volume = `${localVolume}:${CONTAINER_STORAGE_DIRECTORY}`;
    const jobConfigPath = isJobInDynamicConfig
      ? dynamicConfigFilePath
      : processFilePath;

    const { getPreCommand, getPostCommand, evalPreCommand, evalPostCommand } =
      this.commandDecorators.get();

    terminal.sendText(
      `cat ${jobConfigPath} | docker run -i --rm mikefarah/yq -C
      ${getPreCommand} ${getPostCommand} ${evalPreCommand} ${getBinaryPath()} local execute '${jobName}' --config ${jobConfigPath} -v ${volume} ${evalPostCommand}`
    );

    const committedImageRepo = `${COMMITTED_IMAGE_NAMESPACE}/${jobName}`;

    const jobImage = getImageFromJob(jobInConfig);
    const commitProcess = this.runningContainer.commit(
      jobImage,
      committedImageRepo
    );

    const logFilePath = getLogFilePath(configFilePath, jobName);
    if (!this.fsGateway.fs.existsSync(path.dirname(logFilePath))) {
      this.fsGateway.fs.mkdirSync(path.dirname(logFilePath), {
        recursive: true,
      });
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
        this.images.cleanUp(committedImageRepo);
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
