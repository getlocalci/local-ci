import * as cp from 'child_process';
import getSpawnOptions from './getSpawnOptions';

// The same way the CircleCI® checkout step gets the HOME directory.
export default function getHomeDirectory(imageId: string): string {
  const { stdout: homeDir } = cp.spawnSync(
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
      timeout: 4000,
    }
  );

  return homeDir?.toString ? homeDir.toString().trim() : '/home/circleci';
}
