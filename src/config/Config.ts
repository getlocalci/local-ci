import { inject, injectable } from 'inversify';
import * as path from 'path';
import PipelineParameter from './PipelineParameter';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import EditorGateway from 'gateway/EditorGateway';
import FsGateway from 'gateway/FsGateway';
import getDynamicConfigParametersPath from './getDynamicConfigParametersPath';
import getDynamicConfigPath from './getDynamicConfigPath';
import getProcessedConfig from './getProcessedConfig';
import getProcessFilePath from 'process/getProcessFilePath';
import getRepoPath from 'common/getRepoPath';
import ProcessFile from 'process/ProcessFile';
import ReporterGateway from 'gateway/ReporterGateway';
import Spawn from 'common/Spawn';
import Types from 'common/Types';

@injectable()
export default class Config {
  @inject(Types.IChildProcessGateway)
  childProcessGateway!: ChildProcessGateway;

  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(Types.IFsGateway)
  fsGateway!: FsGateway;

  @inject(PipelineParameter)
  pipelineParameter!: PipelineParameter;

  @inject(ProcessFile)
  processFile!: ProcessFile;

  @inject(Spawn)
  spawn!: Spawn;

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
      this.processFile.write(
        processedConfig,
        processFilePath,
        getRepoPath(configFilePath)
      );

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
          dynamicConfigFilePath,
          getRepoPath(configFilePath)
        );
      }
    } catch (e) {
      processError = (e as ErrorWithMessage)?.message;
      if (!suppressMessage) {
        const message = (e as ErrorWithMessage)?.message;
        this.editorGateway.editor.window.showErrorMessage(
          [
            message?.includes('connection refused')
              ? 'Is your machine connected to the internet? '
              : '',
            `There was an error processing the CircleCI config: ${message}`,
          ]
            .filter((message) => !!message)
            .join(' ')
        );
      }

      reporter.sendTelemetryErrorEvent('writeProcessFile');
    }

    return { processedConfig, processError };
  }
}
