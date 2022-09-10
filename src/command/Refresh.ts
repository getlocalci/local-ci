import * as vscode from 'vscode';
import { injectable } from 'inversify';
import { Command } from 'index';
import { JOB_TREE_VIEW_ID } from 'constants/';
import JobProvider from 'job/JobProvider';

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
