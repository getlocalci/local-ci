import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import type { Command } from '.';
import JobFactory from 'job/JobFactory';
import JobProvider from 'job/JobProvider';
import JobRunner from 'job/JobRunner';
import JobTerminals from 'terminal/JobTerminals';
import JobTreeItem from 'job/JobTreeItem';
import { EXIT_JOB_COMMAND } from 'constant';

@injectable()
export default class ExitJob implements Command {
  @inject(JobFactory)
  jobFactory!: JobFactory;

  @inject(JobRunner)
  jobRunner!: JobRunner;

  @inject(JobTerminals)
  jobTerminals!: JobTerminals;

  commandName: string;

  constructor() {
    this.commandName = EXIT_JOB_COMMAND;
  }

  getCallback(context: vscode.ExtensionContext, jobProvider: JobProvider) {
    return (job: JobTreeItem) => {
      job.setIsNotRunning();
      const jobName = job.getJobName();

      jobProvider.refresh(job);
      this.jobTerminals.dispose(jobName);
    };
  }
}
