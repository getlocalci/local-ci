import * as vscode from 'vscode';
import getConfig from './getConfig';
import Job from '../classes/Job';
import Warning from '../classes/Warning';
import Command from '../classes/Command';
import isWindows from './isWindows';
import getAllConfigFilePaths from './getAllConfigFilePaths';

export default async function getJobs(
  context: vscode.ExtensionContext,
  processFilePath: string,
  runningJob?: string
): Promise<vscode.TreeItem[] | []> {
  if (isWindows()) {
    return Promise.resolve([
      new Warning(`Sorry, this doesn't work on Windows`),
    ]);
  }

  const jobs = Object.keys(getConfig(processFilePath)?.jobs ?? {});
  const configFilePaths = await getAllConfigFilePaths(context);
  return jobs.length
    ? jobs.map((jobName) => new Job(jobName, jobName === runningJob))
    : [
        new Warning('Error: No jobs found'),
        new vscode.TreeItem(
          configFilePaths.length
            ? 'Please select a config file'
            : 'Please add a .circleci/config.yml to this workspace'
        ),
        configFilePaths.length
          ? new Command('Select config file', 'localCiJobs.selectRepo')
          : new Command('Try again', 'localCiJobs.refresh'),
      ];
}
