import type vscode from 'vscode';
import type { Command } from '.';
import EditorGateway from 'gateway/EditorGateway';
import JobProvider from 'job/JobProvider';
import LicenseProvider from 'license/LicenseProvider';
import { LICENSE_TREE_VIEW_ID } from 'constant';

export default class RefreshLicenseTree implements Command {
  commandName: string;

  constructor(public editorGateway: EditorGateway) {
    this.commandName = `${LICENSE_TREE_VIEW_ID}.refresh`;
  }

  getCallback(
    context: vscode.ExtensionContext,
    jobProvider: JobProvider,
    licenseProvider: LicenseProvider
  ) {
    return () => {
      licenseProvider.load();
    };
  }
}
