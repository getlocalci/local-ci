import * as path from 'path';
import { inject, injectable } from 'inversify';
import Types from 'common/Types';
import { JobError } from './JobProvider';
import LogFactory from 'log/LogFactory';
import type vscode from 'vscode';
import CommandFactory from './ComandFactory';
import JobFactory from './JobFactory';
import JobTreeItem from './JobTreeItem';
import WarningFactory from './WarningFactory';
import WarningCommandFactory from './WarningCommandFactory';
import type EditorGateway from 'gateway/EditorGateway';
import {
  COMPLAIN_COMMAND,
  CREATE_CONFIG_FILE_COMMAND,
  ENTER_LICENSE_COMMAND,
  GET_LICENSE_COMMAND,
  JOB_TREE_VIEW_ID,
  PROCESS_TRY_AGAIN_COMMAND,
  SELECT_REPO_COMMAND,
  START_DOCKER_COMMAND,
} from 'constant';

type Logs = Record<string, string[]>;
type JobDependencies = Map<string, string[] | null> | undefined;

@injectable()
export default class Children {
  @inject(CommandFactory)
  commandFactory!: CommandFactory;

  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(JobFactory)
  jobFactory!: JobFactory;

  @inject(LogFactory)
  logFactory!: LogFactory;

  @inject(WarningCommandFactory)
  warningCommandFactory!: WarningCommandFactory;

  @inject(WarningFactory)
  warningFactory!: WarningFactory;

  get(
    jobs: string[],
    logs: Logs,
    jobDependencies: JobDependencies,
    runningJob?: string,
    errorType?: JobError,
    errorMessage?: string,
    parentElement?: JobTreeItem
  ): Array<vscode.TreeItem> {
    if (!parentElement) {
      return jobs.length
        ? this.getJobTreeItems(
            jobs.filter((jobName) => {
              return !jobDependencies?.get(jobName);
            }),
            logs,
            runningJob,
            jobDependencies
          )
        : this.getErrorTreeItems(errorType, errorMessage);
    }

    const jobNames = jobDependencies?.keys();
    if (
      !jobNames ||
      ('getJobName' in parentElement && !parentElement?.getJobName())
    ) {
      return [];
    }

    const children = [];
    for (const jobName of jobNames) {
      const dependencies = jobDependencies?.get(jobName) ?? [];
      const dependencyLength = dependencies?.length;
      // This element's children include the jobs that list it as their last dependency in the requires array.
      if (
        dependencyLength &&
        parentElement.label === dependencies[dependencyLength - 1]
      ) {
        children.push(jobName);
      }
    }

    return [
      ...this.getLogTreeItems(
        logs,
        'getJobName' in parentElement ? parentElement.getJobName() : ''
      ),
      ...this.getJobTreeItems(children, logs, runningJob, jobDependencies),
    ];
  }

  getLogTreeItems(
    logs: Record<string, string[]>,
    jobName: string
  ): vscode.TreeItem[] {
    return (
      logs[jobName]?.map((logFile) =>
        this.logFactory.create(path.basename(logFile), logFile)
      ) ?? []
    );
  }

  getJobTreeItems(
    jobs: string[],
    logs: Logs,
    runningJob?: string,
    jobDependencies?: JobDependencies
  ): vscode.TreeItem[] {
    return jobs.map((jobName) =>
      this.jobFactory.create(
        jobName,
        jobName === runningJob,
        this.hasChild(jobName, logs, jobDependencies)
      )
    );
  }

  getErrorTreeItems(
    errorType?: JobError,
    errorMessage?: string
  ): Array<vscode.TreeItem> {
    switch (errorType) {
      case JobError.DockerNotRunning:
        return [
          this.warningCommandFactory.create(
            `Please start Docker`,
            START_DOCKER_COMMAND
          ),
          this.commandFactory.create('Start Docker', START_DOCKER_COMMAND),
          this.commandFactory.create(
            'Try Again',
            `${JOB_TREE_VIEW_ID}.refresh`
          ),
          this.commandFactory.create('Complain To Me', COMPLAIN_COMMAND),
        ];
      case JobError.LicenseKey:
        return [
          this.warningFactory.create('Please enter a Local CI license key.'),
          this.commandFactory.create('Get License', GET_LICENSE_COMMAND),
          this.commandFactory.create('Enter License', ENTER_LICENSE_COMMAND),
          this.commandFactory.create('Complain To Me', COMPLAIN_COMMAND),
        ];
      case JobError.NoConfigFilePathInWorkspace:
        return [
          this.warningFactory.create('Error: No .circleci/config.yml found'),
          this.commandFactory.create(
            'Create a config for me',
            CREATE_CONFIG_FILE_COMMAND
          ),
          this.commandFactory.create('Complain to me', COMPLAIN_COMMAND),
        ];
      case JobError.NoConfigFilePathSelected:
        return [
          this.warningCommandFactory.create(
            'Please select repo',
            SELECT_REPO_COMMAND
          ),
          this.commandFactory.create('Select repo', SELECT_REPO_COMMAND),
          this.commandFactory.create('Complain to me', COMPLAIN_COMMAND),
        ];
      case JobError.ProcessFile:
        return [
          this.warningFactory.create('Error processing the CircleCI config:'),
          new this.editorGateway.editor.TreeItem(
            [
              errorMessage?.includes('connection refused') ||
              errorMessage?.includes('timeout')
                ? 'Is your machine connected to the internet?'
                : '',
              errorMessage,
            ]
              .filter((message) => !!message)
              .join(' ')
          ),
          this.commandFactory.create('Try Again', PROCESS_TRY_AGAIN_COMMAND),
          this.commandFactory.create('Complain To Me', COMPLAIN_COMMAND),
        ];
      default:
        return [];
    }
  }

  /**
   * A job has a child if either:
   *
   * 1. It has a log
   * 2. It's a dependency of another job (another job has it as the last value in its requires array)
   */
  hasChild(
    jobName: string,
    logs: Logs,
    jobDependencies: JobDependencies
  ): boolean {
    if (logs[jobName]) {
      return true;
    }

    for (const [, dependecies] of jobDependencies ?? []) {
      if (
        dependecies?.length &&
        jobName === dependecies[dependecies.length - 1]
      ) {
        return true;
      }
    }

    return false;
  }
}
