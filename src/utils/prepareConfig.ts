import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import TelemetryReporter from 'vscode-extension-telemetry';
import getConfigFromPath from './getConfigFromPath';
import getDynamicConfigFilePath from './getDynamicConfigFilePath';
import getProcessedConfig from './getProcessedConfig';
import getProcessFilePath from './getProcessFilePath';
import replaceDynamicConfigOrb from './replaceDynamicConfigOrb';
import writeProcessFile from './writeProcessFile';

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

    // This runs before writeProcessFile(), as circleci config process
    // will compile the continuation orb, making it unrecognizable.
    // Then, this wouldn't be able to replace that orb with something that works locally.
    fs.writeFileSync(
      processFilePath,
      yaml.dump(replaceDynamicConfigOrb(getConfigFromPath(configFilePath)))
    );

    processedConfig = getProcessedConfig(processFilePath);
    writeProcessFile(processedConfig, processFilePath);

    const dynamicConfigFilePath = getDynamicConfigFilePath(configFilePath);
    if (fs.existsSync(dynamicConfigFilePath)) {
      writeProcessFile(
        getProcessedConfig(dynamicConfigFilePath),
        dynamicConfigFilePath
      );
    }
  } catch (e) {
    processError = (e as ErrorWithMessage)?.message;
    if (!suppressMessage) {
      const message = (e as ErrorWithMessage)?.message;
      const internetMessage = message?.includes('connection refused')
        ? 'Is your machine connected to the internet? '
        : '';
      vscode.window.showErrorMessage(
        `${internetMessage}There was an error processing the CircleCI config: ${message}`
      );
    }

    reporter.sendTelemetryErrorEvent('writeProcessFile');
  }

  return { processedConfig, processError };
}
