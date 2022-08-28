import getDockerError from './getDockerError';

export default function isDockerRunning(): boolean {
  return !getDockerError()?.length;
}
