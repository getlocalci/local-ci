import * as os from 'os';

export default function isWindows(): boolean {
  return os.type() === 'Windows_NT';
}
