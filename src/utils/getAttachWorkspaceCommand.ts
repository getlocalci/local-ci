import * as path from 'path';
import { CONTAINER_STORAGE_DIRECTORY } from '../constants';

export default function getAttachWorkspaceCommand(step: Step): string {
  if (typeof step === 'string' || !step?.attach_workspace?.at) {
    return '';
  }

  return `cp -rn ${path.join(CONTAINER_STORAGE_DIRECTORY, '*')} ${
    step?.attach_workspace?.at
  }`;
}
