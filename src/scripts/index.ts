import scriptGetPicardContainerFunction from './getPicardContainerFunction.sh';
import scriptGetRunningContainerFunction from './getRunningContainerFunction.sh';

function stripBinBash(file: string) {
  return file.replace(`#!/bin/sh\n\n`, '');
}

export const getPicardContainerFunction = stripBinBash(
  scriptGetPicardContainerFunction
);
export const getRunningContainerFunction = stripBinBash(
  scriptGetRunningContainerFunction
);
