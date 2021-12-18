import * as path from 'path';
import { CONTAINER_STORAGE_DIRECTORY } from '../constants';

export default function getAttachWorkspaceCommand(step: Step): string {
  if (typeof step === 'string' || !step?.attach_workspace?.at) {
    return '';
  }

  const attachFrom = `${path.join(CONTAINER_STORAGE_DIRECTORY, path.sep)}.`;

  // BusyBox doesn't allow cp -n.
  return `if [ ! -d ${CONTAINER_STORAGE_DIRECTORY} ]; then
      echo "Error: tried to attach_workspace to ${CONTAINER_STORAGE_DIRECTORY}, but it's not a directory. It might require a job to run before it."
    elif [ ! "$(ls -A ${CONTAINER_STORAGE_DIRECTORY})" ]; then
      echo "Error: tried to attach_workspace to ${CONTAINER_STORAGE_DIRECTORY}, but it's empty. It might require a job to run before it."
    else
      cp -rn ${attachFrom} ${step?.attach_workspace?.at} || cp -ru ${attachFrom} ${step?.attach_workspace?.at}
    fi`;
}
