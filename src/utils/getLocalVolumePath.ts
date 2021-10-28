import * as path from 'path';
import { HOST_TMP_PATH } from '../constants';
import getRootPath from './getRootPath';

// Gets the absolute path to the local volume that stores the workspace between jobs.
export default function getLocalVolumePath(): string {
  return path.join(
    HOST_TMP_PATH,
    'volume',
    path.basename(getRootPath()) || 'unknown'
  );
}
