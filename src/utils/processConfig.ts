import * as cp from 'child_process';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../setup/binary.js';
import getSpawnOptions from './getSpawnOptions';
import getRootPath from './getRootPath';
import writeProcessFile from './writeProcessFile';
import { PROCESS_FILE_PATH } from '../constants';

export default function processConfig(): void {
  try {
    const { stdout } = cp.spawnSync(
      getBinaryPath(),
      ['config', 'process', `${getRootPath()}/.circleci/config.yml`],
      getSpawnOptions()
    );

    fs.writeFileSync(PROCESS_FILE_PATH, stdout.toString().trim());
    writeProcessFile();
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error processing the CircleCI config: ${
        (e as ErrorWithMessage)?.message
      }`
    );
  }
}
