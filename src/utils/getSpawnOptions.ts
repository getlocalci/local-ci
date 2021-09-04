import getRootPath from './getRootPath';
import getPath from './getPath';

export default function getSpawnOptions(): Record<string, unknown> {
  return {
    cwd: getRootPath(),
    env: {
      ...process.env,
      PATH: getPath(), // eslint-disable-line @typescript-eslint/naming-convention
    },
  };
}
