import * as cp from 'child_process';

export default function isDockerRunning(): boolean {
  const { stderr } = cp.spawnSync('docker', ['ps']);
  return !stderr?.length;
}
