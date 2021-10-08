import addTrailingSlash from './addTrailingSlash';
import getHomeDirectory from './getHomeDirectory';

export default function getStorageDirectory(imageId: string): string {
  return `${addTrailingSlash(getHomeDirectory(imageId))}local-ci`;
}
