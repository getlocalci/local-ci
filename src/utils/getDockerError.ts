import * as cp from 'child_process';

export default function isDockerRunning(): string {
  const { stderr } = cp.spawnSync('docker', ['ps']);
  return stderr;
}
