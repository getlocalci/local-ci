import type vscode from 'vscode';
import JobProvider from 'job/JobProvider';

export interface Command {
  commandName: string;
  getCallback: (
    context: vscode.ExtensionContext,
    jobProvider: JobProvider,
  ) => (arg0: any) => void | Promise<void>;
}
