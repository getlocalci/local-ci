import * as cp from 'child_process';
import * as vscode from 'vscode';
import getSpawnOptions from './getSpawnOptions';

// The same way the CircleCI® checkout step gets the HOME directory.
export default function getHomeDirectory(
  imageId: string,
  terminal?: vscode.Terminal
): Promise<string> {
  const defaultHomeDir = '/home/circleci';
  const { stdout, stderr } = cp.spawn(
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
      timeout: 5000,
    }
  );

  return new Promise((resolve) => {
    stdout.on('data', (data) => {
      resolve(data?.toString ? data.toString().trim() : defaultHomeDir);
    });

    stderr.on('data', (data) => {
      if (terminal && data?.toString) {
        terminal?.sendText(`echo "${data.toString()}"`);
      }
    });
  });
}
