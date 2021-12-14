import * as path from 'path';

export function getTestFilePath(basename: string, file: string): string {
  return path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'src',
    'test',
    basename,
    file
  );
}

export function normalize(text: string | undefined): string {
  return String(text).replace(/\s+/g, ' ');
}
