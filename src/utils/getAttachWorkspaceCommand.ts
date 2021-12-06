import * as path from 'path';
import { CONTAINER_STORAGE_DIRECTORY } from '../constants';

export default function getAttachWorkspaceCommand(step: Step): string {
  if (typeof step === 'string' || !step?.attach_workspace?.at) {
    return '';
  }

  const attachFrom = path.join(CONTAINER_STORAGE_DIRECTORY, '*');

  // BusyBox doesn't have the -n option.
  return `if [ -d ${attachFrom} ]; then cp -rn ${attachFrom} ${step?.attach_workspace?.at} || cp -ru ${attachFrom} ${step?.attach_workspace?.at}; fi`;
}
