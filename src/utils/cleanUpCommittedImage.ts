import * as cp from 'child_process';
import getSpawnOptions from './getSpawnOptions';
import { GET_CONTAINER_FUNCTION } from '../constants';

export default function cleanUpCommittedImage(
  committedImageName: string
): void {
  cp.spawnSync(`docker`, ['rmi', committedImageName], getSpawnOptions());
  cp.spawnSync(
    `${GET_CONTAINER_FUNCTION} docker rm $(get_container ${committedImageName})`,
    [],
    getSpawnOptions()
  );
}
