import { injectable } from 'inversify';
import type vscode from 'vscode';
import type { Command } from './index';
import JobProvider from 'job/JobProvider';
import { JOB_TREE_VIEW_ID } from 'constant';

@injectable()
export default class Refresh implements Command {
  commandName: string;

  constructor() {
    this.commandName = `${JOB_TREE_VIEW_ID}.refresh`;
  }

  getCallback(context: vscode.ExtensionContext, jobProvider: JobProvider) {
    return () => {
      jobProvider.hardRefresh();
    };
  }
}
