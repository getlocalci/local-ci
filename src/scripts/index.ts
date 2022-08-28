import scriptAddEnvVars from './addEnvVars.sh';
import scriptDockerExecRunningContainer from './dockerExecRunningContainer.sh';
import scriptGetPicardContainerFunction from './getPicardContainerFunction.sh';
import scriptGetRunningContainerFunction from './getRunningContainerFunction.sh';

function stripBinSh(file: string) {
  return file.replace('^#!/bin/sh', '').replace(`^\n\n`, '');
}

export const addEnvVars = stripBinSh(scriptAddEnvVars);
export const dockerExecRunningContainer = stripBinSh(
  scriptDockerExecRunningContainer
);
export const getPicardContainerFunction = stripBinSh(
  scriptGetPicardContainerFunction
);
export const getRunningContainerFunction = stripBinSh(
  scriptGetRunningContainerFunction
);
