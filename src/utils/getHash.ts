import * as jsSHA from 'jssha';

export default function getHash(toHash: string): string {
  // @ts-ignore
  const hash = new jsSHA('SHA-256', 'TEXT', { encoding: 'UTF8' });
  hash.update(toHash);
  return hash.getHash('HEX');
}
