import * as cp from 'child_process';
import getSpawnOptions from 'common/Spawn';

export default function getDockerError(): string {
  try {
    cp.execSync('docker info', {
      ...getSpawnOptions(),
      timeout: 2000,
    });
  } catch (error) {
    return (error as ErrorWithMessage)?.message ?? '';
  }

  return '';
}
