import * as cp from 'child_process';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../node/binary.js';
import getSpawnOptions from './getSpawnOptions';

export default function getProcessedConfig(configFilePath: string): string {
  try {
    const { stdout, stderr } = cp.spawnSync(
      getBinaryPath(),
      ['config', 'process', configFilePath],
      getSpawnOptions()
    );

    if (!stdout?.length) {
      throw new Error(
        stderr?.length ? stderr.toString() : 'Failed to process the config'
      );
    }

    return stdout.toString().trim();
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error processing the CircleCI config: ${
        (e as ErrorWithMessage)?.message
      }`
    );

    return '';
  }
}
