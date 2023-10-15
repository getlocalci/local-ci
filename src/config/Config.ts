import * as path from 'path';
import PipelineParameter from './PipelineParameter';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import EditorGateway from 'gateway/EditorGateway';
import FsGateway from 'gateway/FsGateway';
import getDynamicConfigParametersPath from './getDynamicConfigParametersPath';
import getDynamicConfigPath from './getDynamicConfigPath';
import getDynamicConfigProcessFilePath from 'process/getDynamicConfigProcessFilePath';
import getProcessedConfig from './getProcessedConfig';
import getProcessFilePath from 'process/getProcessFilePath';
import ProcessFile from 'process/ProcessFile';
import ReporterGateway from 'gateway/ReporterGateway';
import Spawn from 'common/Spawn';
import { RERUN_JOB_COMMAND } from 'constant';

export default class Config {
  constructor(
    public childProcessGateway: ChildProcessGateway,
    public editorGateway: EditorGateway,
    public fsGateway: FsGateway,
    public pipelineParameter: PipelineParameter,
    public processFile: ProcessFile,
    public spawn: Spawn
  ) {}

  process(
    configFilePath: string,
    reporter: ReporterGateway['reporter'],
    suppressMessage?: boolean
  ): { processedConfig: string; processError: string } {
    let processedConfig = '';
    let processError = '';

    try {
      const processFilePath = getProcessFilePath(configFilePath);

      if (!this.fsGateway.fs.existsSync(path.dirname(processFilePath))) {
        this.fsGateway.fs.mkdirSync(path.dirname(processFilePath), {
          recursive: true,
        });
      }

      processedConfig = getProcessedConfig(
        configFilePath,
        this.childProcessGateway.cp,
        this.spawn.getOptions()
      );
      this.processFile.write(processedConfig, processFilePath, configFilePath);

      const dynamicConfigFilePath = getDynamicConfigPath(configFilePath);
      if (this.fsGateway.fs.existsSync(dynamicConfigFilePath)) {
        this.pipelineParameter.replace(
          getDynamicConfigParametersPath(configFilePath),
          dynamicConfigFilePath
        );

        this.processFile.write(
          getProcessedConfig(
            dynamicConfigFilePath,
            this.childProcessGateway.cp,
            this.spawn.getOptions()
          ),
          getDynamicConfigProcessFilePath(configFilePath),
          configFilePath
        );
      }
    } catch (e) {
      processError = (e as ErrorWithMessage)?.message;
      if (!suppressMessage) {
        const message = (e as ErrorWithMessage)?.message;
        const tryAgain = 'Try Again';
        this.editorGateway.editor.window
          .showErrorMessage(
            [
              message?.includes('connection refused')
                ? 'Is your machine connected to the internet? '
                : '',
              `There was an error processing the CircleCI config: ${message}`,
            ]
              .filter(Boolean)
              .join(' '),
            { detail: 'Error processing config' },
            tryAgain
          )
          .then((clicked) => {
            if (clicked === tryAgain) {
              this.editorGateway.editor.commands.executeCommand(
                RERUN_JOB_COMMAND
              );
            }
          });
      }

      reporter.sendTelemetryErrorEvent('writeProcessFile');
    }

    return { processedConfig, processError };
  }
}
