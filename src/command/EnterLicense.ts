import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import type { Command } from './index';
import { ENTER_LICENSE_COMMAND } from 'constants/';
import JobProvider from 'job/JobProvider';
import LicenseInput from 'license/LicenseInput';
import LicenseProvider from 'license/LicenseProvider';

@injectable()
export default class EnterLicense implements Command {
  @inject(LicenseInput)
  licenseInput!: LicenseInput;

  commandName: string;

  constructor() {
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
