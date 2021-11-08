import * as path from 'path';

// The volume path needs to be absolute.
// So if the directory argument is ~/project,
// it will convert it to /root/project
// if homeDirectory is /root.
function convertHomeToAbsolute(directory: string, homeDirectory: string) {
  return directory.startsWith('~/')
    ? path.join(homeDirectory, directory.replace('~/', ''))
    : directory;
}

// If the directory is . this replaces it with either the working_directory or the default.
function replaceDot(directory: string, job: Job | undefined) {
  const defaultWorkingDirectory = '~/project';
  const newDirectory =
    '.' === directory
      ? job?.working_directory ?? defaultWorkingDirectory
      : directory;

  return newDirectory === '.' ? defaultWorkingDirectory : newDirectory;
}

export default function normalizeDirectory(
  directory: string,
  homeDirectory: string,
  job: Job | undefined
): string {
  return convertHomeToAbsolute(replaceDot(directory, job), homeDirectory);
}
