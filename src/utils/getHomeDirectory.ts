import * as cp from 'child_process';
import * as vscode from 'vscode';
import getSpawnOptions from './getSpawnOptions';

// The same way the CircleCI® checkout step gets the HOME directory.
export default function getHomeDirectory(imageId: string): string {
  const { stdout: homeDir, stderr } = cp.spawnSync(
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
    {
      ...getSpawnOptions(),
      timeout: 15000,
    }
  );

  if (stderr?.toString && !!homeDir?.toString && !homeDir.toString()) {
    vscode.window.showWarningMessage(
      `Could not find the home directory of the image ${imageId}`,
      {
        detail: 'The license key is invalid',
      }
    );
  }

  return homeDir?.toString ? homeDir.toString().trim() : '/home/circleci';
}
