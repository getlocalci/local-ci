import type vscode from 'vscode';
import type { Command } from '.';
import JobProvider from 'job/JobProvider';
import LicenseInput from 'license/LicenseInput';
import LicenseProvider from 'license/LicenseProvider';
import { ENTER_LICENSE_COMMAND } from 'constant';

export default class EnterLicense implements Command {
  commandName: string;

  constructor(public licenseInput: LicenseInput) {
    this.commandName = ENTER_LICENSE_COMMAND;
  }

  getCallback(
    context: vscode.ExtensionContext,
    jobProvider: JobProvider,
    licenseProvider: LicenseProvider
  ) {
    return () => {
      this.licenseInput.show(
        context,
        () => licenseProvider.load(),
        () => jobProvider.hardRefresh()
      );
    };
  }
}
