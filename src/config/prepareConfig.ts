import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import TelemetryReporter from '@vscode/extension-telemetry';
import applyPipelineParameters from './applyPipelineParameters';
import getDynamicConfigParametersPath from './getDynamicConfigParametersPath';
import getDynamicConfigPath from './getDynamicConfigPath';
import getProcessedConfig from './getProcessedConfig';
import getProcessFilePath from 'process/getProcessFilePath';
import writeProcessFile from 'process/ProcessFile';

export default function prepareConfig(
  configFilePath: string,
  reporter: TelemetryReporter,
  suppressMessage?: boolean
): { processedConfig: string; processError: string } {
  let processedConfig = '';
  let processError = '';

  try {
    const processFilePath = getProcessFilePath(configFilePath);

    if (!fs.existsSync(path.dirname(processFilePath))) {
      fs.mkdirSync(path.dirname(processFilePath), { recursive: true });
    }

    processedConfig = getProcessedConfig(configFilePath);
    writeProcessFile(processedConfig, processFilePath);

    const dynamicConfigFilePath = getDynamicConfigPath(configFilePath);
    if (fs.existsSync(dynamicConfigFilePath)) {
      applyPipelineParameters(
        getDynamicConfigParametersPath(configFilePath),
        dynamicConfigFilePath
      );

      writeProcessFile(
        getProcessedConfig(dynamicConfigFilePath),
        dynamicConfigFilePath
      );
    }
  } catch (e) {
    processError = (e as ErrorWithMessage)?.message;
    if (!suppressMessage) {
      const message = (e as ErrorWithMessage)?.message;
      vscode.window.showErrorMessage(
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
