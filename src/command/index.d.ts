import JobProvider from 'job/JobProvider';
import * as vscode from 'vscode';

export interface Command {
  commandName: string;
  getCallback: (context: vscode.ExtensionContext, jobProvider: JobProvider) => () => void | Promise<void>;
}
