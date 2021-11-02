import * as path from 'path';

export default function convertHomeDirToAbsolute(
  directory: string,
  homeDirectory: string
): string {
  if (directory.startsWith('~/')) {
    return path.join(homeDirectory, directory.replace('~/', ''));
  }

  return directory;
}
