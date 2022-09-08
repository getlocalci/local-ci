import getDockerError from './Docker';

export default function isDockerRunning(): boolean {
  return !getDockerError()?.length;
}
