import type vscode from 'vscode';
import JobProvider from 'job/JobProvider';
import LicenseProvider from 'license/LicenseProvider';

export interface Command {
  commandName: string;
  getCallback: (
    context:  vscode.ExtensionContext,
       jobProvider: JobProvider,
    licenseProvider: LicenseProvider,
  ) => (arg0: any) => void | Promise<void>;
}
