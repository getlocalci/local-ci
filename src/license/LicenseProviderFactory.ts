import type vscode from 'vscode';
import EditorGateway from 'gateway/EditorGateway';
import License from './License';
import LicenseInput from './LicenseInput';
import LicensePresenter from './LicensePresenter';
import LicenseProvider from './LicenseProvider';

export default class LicenseProviderFactory {
  constructor(
    public license: License,
    public licenseInput: LicenseInput,
    public licensePresenter: LicensePresenter,
    public editorGateway: EditorGateway
  ) {}

  create(context: vscode.ExtensionContext, licenseSuccessCallback: () => void) {
    return new LicenseProvider(
      context,
      licenseSuccessCallback,
      this.license,
      this.licenseInput,
      this.licensePresenter,
      this.editorGateway
    );
  }
}
