import * as vscode from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import Job from '../classes/Job';
import Warning from '../classes/Warning';
import Command from '../classes/Command';
import getAllConfigFilePaths from './getAllConfigFilePaths';
import getConfig from './getConfig';
import isWindows from './isWindows';
import { EXTENSION_ID, EXTENSION_VERSION, TELEMETRY_KEY } from '../constants';

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
  const config = getConfig(processedConfig);
  const jobs =
    !!config && Object.values(config?.workflows)?.length
      ? Object.values(config?.workflows).reduce(
          (accumulator: string[], workflow) => {
            if (!workflow?.jobs) {
              return accumulator;
            }
            return [
              ...accumulator,
              ...workflow.jobs.reduce((accumulator: string[], job) => {
                return [
                  ...accumulator,
                  ...(typeof job === 'string' ? [job] : Object.keys(job)),
                ];
              }, []),
            ];
          },
          []
        )
      : [];

  if (!jobs.length) {
    new TelemetryReporter(
      EXTENSION_ID,
      EXTENSION_VERSION,
      TELEMETRY_KEY
    ).sendTelemetryEvent('noJobs');
  }

  return jobs.length
    ? jobs.map((jobName) => new Job(jobName, jobName === runningJob))
    : [
        new Warning('Error: No jobs found'),
        (await getAllConfigFilePaths(context)).length
          ? new Command('Select repo to get jobs', 'localCiJobs.selectRepo')
          : new vscode.TreeItem(
              'Please add a .circleci/config.yml to this workspace'
            ),
      ];
}
