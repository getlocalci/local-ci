import scriptAddEnvVars from './addEnvVars.sh';
import scriptDockerExecRunningContainer from './dockerExecRunningContainer.sh';
import scriptGetPicardContainerFunction from './getPicardContainerFunction.sh';
import scriptGetRunningContainerFunction from './getRunningContainerFunction.sh';
import scriptWriteBuildAgentSettings from './writeBuildAgentSettings.sh';

function stripDevNotation(file: string) {
  return file
    .replace(/^#!\/bin\/sh/, '')
    .replace(/^\n\n/, '')
    .replace(/^# shellcheck .*\n/, '');
}

export const addEnvVars = stripDevNotation(scriptAddEnvVars);
export const dockerExecRunningContainer = stripDevNotation(
  scriptDockerExecRunningContainer
);
export const getPicardContainerFunction = stripDevNotation(
  scriptGetPicardContainerFunction
);
export const getRunningContainerFunction = stripDevNotation(
  scriptGetRunningContainerFunction
);

export const writeBuildAgentSettings = stripDevNotation(
  scriptWriteBuildAgentSettings
);
