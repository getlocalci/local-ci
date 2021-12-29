import getFirstWorkspaceRootPath from './getFirstWorkspaceRootPath';
import getPath from './getPath';

export default function getSpawnOptions(cwd?: string): SpawnOptions {
  return {
    cwd: cwd || getFirstWorkspaceRootPath(),
    env: {
      ...process.env,
      PATH: getPath(), // eslint-disable-line @typescript-eslint/naming-convention
    },
  };
}
