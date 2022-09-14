import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import Types from 'common/Types';
import EditorGateway from 'gateway/EditorGateway';
import License from './License';
import LicenseInput from './LicenseInput';
import LicensePresenter from './LicensePresenter';
import LicenseProvider from './LicenseProvider';

@injectable()
export default class LicenseProviderFactory {
  @inject(License)
  license!: License;

  @inject(LicenseInput)
  licenseInput!: LicenseInput;

  @inject(LicensePresenter)
  licensePresenter!: LicensePresenter;

  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

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
