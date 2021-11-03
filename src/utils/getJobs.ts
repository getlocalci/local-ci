import * as vscode from 'vscode';
import Job from '../classes/Job';
import Warning from '../classes/Warning';
import Command from '../classes/Command';
import getAllConfigFilePaths from './getAllConfigFilePaths';
import getConfig from './getConfig';
import isWindows from './isWindows';

export default async function getJobs(
  context: vscode.ExtensionContext,
  processedConfig: string,
  runningJob?: string
): Promise<vscode.TreeItem[]> {
  if (isWindows()) {
    return Promise.resolve([
      new Warning(`Sorry, this doesn't work on Windows`),
    ]);
  }

  const jobs = Object.keys(getConfig(processedConfig)?.jobs ?? {});
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
