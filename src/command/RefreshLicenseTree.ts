import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import type { Command } from './index';
import { LICENSE_TREE_VIEW_ID } from 'constant';
import JobProvider from 'job/JobProvider';
import LicenseProvider from 'license/LicenseProvider';
import EditorGateway from 'gateway/EditorGateway';
import Types from 'common/Types';

@injectable()
export default class RefreshLicenseTree implements Command {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  commandName: string;

  constructor() {
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
