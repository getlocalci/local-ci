import JobProvider from 'job/JobProvider';
import LicenseProvider from 'license/LicenseProvider';
import type vscode from 'vscode';

export interface Command {
  commandName: string;
  getCallback: (
    context: vscode.ExtensionContext,
    jobProvider: JobProvider,
    licenseProvider: LicenseProvider,
  ) => () => void | Promise<void>;
}
