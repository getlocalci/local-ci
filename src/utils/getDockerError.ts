import * as cp from 'child_process';
import getSpawnOptions from './getSpawnOptions';

export default function getDockerError(): string {
  try {
    cp.execSync('docker -v', {
      ...getSpawnOptions(),
      timeout: 2000,
    });
  } catch (error) {
    return (error as ErrorWithMessage)?.message ?? '';
  }

  return '';
}
