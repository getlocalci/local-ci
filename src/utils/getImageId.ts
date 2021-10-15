import * as cp from 'child_process';
import getImageWithoutTag from './getImageWithoutTag';
import getSpawnOptions from './getSpawnOptions';

function imageQuery(imageName: string): string {
  const { stdout: imageQuery } = cp.spawnSync(
    'docker',
    ['images', '-q', '-f', `reference=${getImageWithoutTag(imageName)}`],
    getSpawnOptions()
  );

  return imageQuery?.toString ? imageQuery.toString() : '';
}

export default function getImageId(imageName: string): string {
  let imageId = imageQuery(imageName);

  if (!imageId) {
    cp.spawnSync('docker', ['image', 'pull', imageName], getSpawnOptions());
    imageId = imageQuery(imageName);
  }

  return imageId ? imageId.trim() : '';
}
