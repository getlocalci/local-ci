import * as cp from 'child_process';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../node/binary.js';
import getSpawnOptions from './getSpawnOptions';
import { PROCESS_FILE_DIRECTORY } from '../constants';
import getProcessFilePath from './getProcessFilePath';

export default function processConfig(configFilePath: string): void {
  if (!fs.existsSync(PROCESS_FILE_DIRECTORY)) {
    fs.mkdirSync(PROCESS_FILE_DIRECTORY, { recursive: true });
  }

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

    fs.writeFileSync(getProcessFilePath(), stdout.toString().trim());
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error processing the CircleCI config: ${
        (e as ErrorWithMessage)?.message
      }`
    );
  }
}
