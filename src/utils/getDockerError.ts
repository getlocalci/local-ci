import * as cp from 'child_process';

export default function getDockerError(): string {
  return cp.spawnSync('docker', ['ps'])?.stderr;
}
