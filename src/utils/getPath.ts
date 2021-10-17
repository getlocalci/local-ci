import isMac from './isMac';

// Mainly copied from https://github.com/microsoft/vscode-docker/blob/1aa4d6050020ba5c13f249af3ed4022e9b671534/src/utils/spawnAsync.ts#L254
// Looks for `/usr/local/bin` in the PATH.
// Must be whole, i.e. the left side must be the beginning of the string or :, and the right side must be the end of the string or :
// Case-insensitive, because Mac is.
export default function getPath(): string {
  const path = process.env.PATH || '';

  return isMac() && !/(?<=^|:)\/usr\/local\/bin(?=$|:)/i.test(path)
    ? `${path}:/usr/local/bin`
    : path;
}
