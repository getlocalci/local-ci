import scriptAddEnvVars from './addEnvVars.sh';
import scriptCleanUpCommittedImages from './cleanUpCommittedImages.sh';

import scriptDockerExecRunningContainer from './dockerExecRunningContainer.sh';
import scriptGetPicardContainerFunction from './getPicardContainerFunction.sh';
import scriptGetRunningContainerFunction from './getRunningContainerFunction.sh';
import scriptRestoreCache from './restoreCache.sh';
import scriptWriteBuildAgentSettings from './writeBuildAgentSettings.sh';

function stripDevSyntax(file: string) {
  return file
    .replace(/^#!\/bin\/sh/, '')
    .replace(/^\n\n/, '')
    .replace(/^# shellcheck .*\n/, '');
}

export const addEnvVars = stripDevSyntax(scriptAddEnvVars);
export const cleanUpCommittedImages = stripDevSyntax(
  scriptCleanUpCommittedImages
);
export const dockerExecRunningContainer = stripDevSyntax(
  scriptDockerExecRunningContainer
);
export const getPicardContainerFunction = stripDevSyntax(
  scriptGetPicardContainerFunction
);
export const getRunningContainerFunction = stripDevSyntax(
  scriptGetRunningContainerFunction
);
export const restoreCache = stripDevSyntax(scriptRestoreCache);
export const writeBuildAgentSettings = stripDevSyntax(
  scriptWriteBuildAgentSettings
);
