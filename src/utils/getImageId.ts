import * as cp from 'child_process';
import getImageWithoutTag from './getImageWithoutTag';
import getSpawnOptions from './getSpawnOptions';

export default function getImageId(imageName: string): string {
  const { stdout: imageQuery } = cp.spawnSync(
    'docker',
    ['images', '-q', '-f', `reference=${getImageWithoutTag(imageName)}`],
    getSpawnOptions()
  );

  return imageQuery ? imageQuery.toString().trim() : '';
}
