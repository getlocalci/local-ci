import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { LICENSE_ERROR, GET_LICENSE_KEY_URL, LICENSE_KEY } from 'constant';
import getLicenseErrorMessage from 'license/getLicenseErrorMessage';
import License from './License';
import sanitizeLicenseKey from './sanitizeLicenseKey';
import EditorGateway from 'gateway/EditorGateway';
import Types from 'common/Types';

@injectable()
export default class LicenseInput {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(License)
  license!: License;

  async show(
    context: vscode.ExtensionContext,
    completedCallback: () => void,
    successCallback: () => void
  ): Promise<void> {
    const enteredLicenseKey =
      await this.editorGateway.editor.window.showInputBox({
        title: 'Local CI license key',
        prompt: 'Please enter your Local CI license key',
      });
    const enterKeyText = 'Enter license key';
    const enterKeyAgainText = 'Enter license key again';
    const getKeyText = 'Get license key';

    if (enteredLicenseKey === undefined) {
      return; // They pressed Escape or exited the input box.
    }

    const isValid = await this.license.isValid(
      context,
      true,
      sanitizeLicenseKey(enteredLicenseKey)
    );

    if (isValid) {
      context.secrets.store(LICENSE_KEY, sanitizeLicenseKey(enteredLicenseKey));
      this.editorGateway.editor.window.showInformationMessage(
        'Thank you, your Local CI license key is valid and activated!'
      );
      completedCallback();
      successCallback();
    } else {
      completedCallback();
      const warningMessage = enteredLicenseKey
        ? `Sorry, there was a problem activating the Local CI license key: ${getLicenseErrorMessage(
            await context.secrets.get(LICENSE_ERROR)
          )}`
        : 'Please enter a Local CI license key';
      const clicked = await this.editorGateway.editor.window.showWarningMessage(
        warningMessage,
        { detail: 'The license key is invalid' },
        enteredLicenseKey ? enterKeyAgainText : enterKeyText,
        getKeyText
      );

      if (clicked === enterKeyText || clicked === enterKeyAgainText) {
        await this.show(context, completedCallback, successCallback);
        return;
      }

      if (clicked === getKeyText) {
        this.editorGateway.editor.env.openExternal(
          this.editorGateway.editor.Uri.parse(GET_LICENSE_KEY_URL)
        );
      }
    }
  }
}
