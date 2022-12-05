import { sha256 } from 'cross-sha256';

export default function getHash(toHash: string): string {
  return new sha256().update(toHash).digest('hex');
}
