import scriptAddEnvVars from './addEnvVars.sh';
import scriptDockerExecRunningContainer from './dockerExecRunningContainer.sh';
import scriptGetPicardContainerFunction from './getPicardContainerFunction.sh';
import scriptGetRunningContainerFunction from './getRunningContainerFunction.sh';

function stripBinBash(file: string) {
  return file.replace(`#!/bin/sh\n\n`, '');
}

export const addEnvVars = stripBinBash(scriptAddEnvVars);
export const dockerExecRunningContainer = stripBinBash(
  scriptDockerExecRunningContainer
);
export const getPicardContainerFunction = stripBinBash(
  scriptGetPicardContainerFunction
);
export const getRunningContainerFunction = stripBinBash(
  scriptGetRunningContainerFunction
);
