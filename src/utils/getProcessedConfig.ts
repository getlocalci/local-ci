import * as cp from 'child_process';
import * as vscode from 'vscode';
import { getBinaryPath } from '../../node/binary.js';
import getSpawnOptions from './getSpawnOptions';

export default function getProcessedConfig(
  context: vscode.ExtensionContext,
  configFilePath: string
): Promise<string> {
  if (!configFilePath) {
    return Promise.resolve('');
  }

  const { stdout, stderr } = cp.spawn(
    getBinaryPath(),
    ['config', 'process', configFilePath],
    getSpawnOptions()
  );

  return new Promise((resolve, reject) => {
    stdout.on('data', (data) => {
      resolve(data?.toString ? data.toString().trim() : '/home/circleci');
    });

    stderr.on('data', (data) => {
      if (data?.toString) {
        reject(`error procesing the config file: "${data.toString()}"`);
      }
    });
  });
}
