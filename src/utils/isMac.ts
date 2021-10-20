import * as os from 'os';

export default function isMac(): boolean {
  return os.type() === 'Darwin';
}
