import * as cp from 'child_process';
import * as vscode from 'vscode';
import getSpawnOptions from './getSpawnOptions';

// The same way the CircleCI® checkout step gets the HOME directory.
export default function getHomeDirectory(
  imageId: string,
  terminal?: vscode.Terminal
): Promise<string> {
  const { stdout: homeDir, stderr } = cp.spawn(
    'docker',
    [
      'run',
      imageId,
      '/bin/sh',
      '-c',
      `if [ "$HOME" = "/" ]; then
        getent passwd $(id -un) | cut -d: -f6
      else
        echo $HOME
      fi`,
    ],
    getSpawnOptions()
  );

  return new Promise((resolve, reject) => {
    homeDir.on('data', (data) => {
      resolve(data?.toString ? data.toString().trim() : '/home/circleci');
    });

    stderr.on('data', (data) => {
      if (data?.toString && terminal) {
        terminal.sendText(`echo "${data.toString()}"`);
      }
    });

    stderr.on('error', (error) => {
      if (error.message) {
        vscode.window.showWarningMessage(
          `Could not find the home directory of the image ${imageId}: ${error.message}`,
          {
            detail: 'Could not find the home directory',
          }
        );
      }

      reject('/home');
    });
  });
}
