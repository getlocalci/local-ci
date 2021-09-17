import * as cp from 'child_process';
import * as vscode from 'vscode';
import getImageWithoutTag from './getImageWithoutTag';
import getSpawnOptions from './getSpawnOptions';

export default function getDefaultWorkspace(imageName: string): string {
  if (!imageName) {
    return '/home/circleci/project';
  }

  try {
    const { stdout: imageQuery } = cp.spawnSync(
      'docker',
      ['images', '-q', '-f', `reference=${getImageWithoutTag(imageName)}`],
      getSpawnOptions()
    );

    if (!imageQuery.toString()) {
      cp.spawnSync('docker', ['image', 'pull', imageName], getSpawnOptions());
    }

    const { stdout: user } = cp.spawnSync(
      'docker',
      ['image', 'inspect', imageName, '--format', '{{.Config.User}}'],
      getSpawnOptions()
    );

    return `/home/${user?.toString().trim() || 'circleci'}/project`;
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error getting the default workspace: ${
        (e as ErrorWithMessage)?.message
      }`
    );

    return '';
  }
}
