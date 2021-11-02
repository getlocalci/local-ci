import * as vscode from 'vscode';
import getConfigFromPath from './getConfigFromPath';
import Job from '../classes/Job';
import Warning from '../classes/Warning';
import Command from '../classes/Command';
import isWindows from './isWindows';
import getAllConfigFilePaths from './getAllConfigFilePaths';

export default async function getJobs(
  context: vscode.ExtensionContext,
  processFilePath: string,
  runningJob?: string
): Promise<vscode.TreeItem[]> {
  if (isWindows()) {
    return Promise.resolve([
      new Warning(`Sorry, this doesn't work on Windows`),
    ]);
  }

  const jobs = Object.keys(getConfigFromPath(processFilePath)?.jobs ?? {});
  const configFilePaths = await getAllConfigFilePaths(context);
  return jobs.length
    ? jobs.map((jobName) => new Job(jobName, jobName === runningJob))
    : [
        new Warning('Error: No jobs found'),
        configFilePaths.length
          ? new Command('Select repo to get jobs', 'localCiJobs.selectRepo')
          : new vscode.TreeItem(
              'Please add a .circleci/config.yml to this workspace'
            ),
      ];
}
