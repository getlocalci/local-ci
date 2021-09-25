import * as cp from 'child_process';

export default function getDockerError(): string {
  const { stderr } = cp.spawnSync('docker', ['ps']);
  return stderr;
}
