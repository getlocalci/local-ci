import * as cp from 'child_process';
import * as vscode from 'vscode';
import getImageWithoutTag from './getImageWithoutTag';
import getSpawnOptions from './getSpawnOptions';

export default function getDefaultWorkspace(imageName: string): string {
  if (!imageName) {
    return '/home/circleci/project';
  }

  try {
    cp.spawnSync(
      `if [[ -z $(docker images -q -f reference=${getImageWithoutTag(
        imageName
      )}) ]]; then
        docker image pull ${imageName}
      fi`,
      [],
      getSpawnOptions()
    );

    const user = cp.spawnSync(
      'docker',
      ['image', 'inspect', imageName, '--format', '{{.Config.User}}'],
      getSpawnOptions()
    );

    return `/home/${user?.stdout.toString().trim() || 'circleci'}/project`;
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error getting the default workspace: ${e.message}`
    );

    return '';
  }
}
