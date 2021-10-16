import * as fs from 'fs';
import * as vscode from 'vscode';
import getConfigFile from './getConfigFile';
import getRootPath from './getRootPath';
import Job from '../classes/Job';
import Warning from '../classes/Warning';
import Command from '../classes/Command';

export default function getJobs(
  configFilePath: string,
  runningJob?: string
): vscode.TreeItem[] | [] {
  const jobs = Object.keys(getConfigFile(configFilePath)?.jobs ?? {});
  return jobs.length
    ? jobs.map((jobName) => new Job(jobName, jobName === runningJob))
    : [
        new Warning('Error: No jobs found'),
        new vscode.TreeItem(
          fs.existsSync(`${getRootPath()}/.circleci/config.yml`)
            ? 'The config file was not processed'
            : 'There is no .circleci/config.yml file in the root of the workspace'
        ),
        new Command('Try again', 'localCiJobs.refresh'),
      ];
}
