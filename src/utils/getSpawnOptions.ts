import getRootPath from './getRootPath';
import getPath from './getPath';

export default function getSpawnOptions(cwd?: string): SpawnOptions {
  return {
    cwd: cwd || getRootPath(),
    env: {
      ...process.env,
      PATH: getPath(), // eslint-disable-line @typescript-eslint/naming-convention
    },
  };
}
