import type vscode from 'vscode';
import EditorGateway from 'gateway/EditorGateway';
import getLicenseErrorMessage from 'license/getLicenseErrorMessage';
import License from 'license/License';
import LicenseInput from 'license/LicenseInput';
import LicensePresenter from 'license/LicensePresenter';
import { LICENSE_ERROR } from 'constant';

function getNonce() {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  return [...Array(32)].reduce(
    (accumulator: string) =>
      accumulator +
      possible.charAt(Math.floor(Math.random() * possible.length)),
    ''
  );
}

// Mainly taken from https://github.com/microsoft/vscode-extension-samples/blob/57bcea06b04b0f602c9e702147c831dccd0eee4f/webview-view-sample/src/extension.ts
export default class LicenseProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'localCiLicense';
  private extensionUri: vscode.Uri;
  private webviewView?: vscode.WebviewView;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private licenseSuccessCallback: () => void,
    private license: License,
    private licenseInput: LicenseInput,
    private licensePresenter: LicensePresenter,
    private editorGateway: EditorGateway
  ) {
    this.extensionUri = context.extensionUri;
  }

  async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
    this.webviewView = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    this.load();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.type === 'enterLicense') {
        this.licenseInput.show(
          this.context,
          () => this.load(),
          () => this.licenseSuccessCallback()
        );
      }

      if (data.type === 'retryLicenseValidation') {
        const isValid = await this.license.isValid(this.context, true);

        if (isValid) {
          this.editorGateway.editor.window.showInformationMessage(
            'Validation worked, your Local CI license key is valid and activated!'
          );
          this.load();
          this.licenseSuccessCallback();
        } else {
          const warningMessage = `Sorry, validation didn't work. ${getLicenseErrorMessage(
            await this.context.secrets.get(LICENSE_ERROR)
          )}`;
          this.editorGateway.editor.window.showWarningMessage(warningMessage, {
            detail: 'The license key is invalid',
          });
        }
      }
    });
  }

  async load(): Promise<void> {
    if (!this.webviewView) {
      return;
    }

    this._getHtmlForWebview().then((newHtml) => {
      if (this.webviewView) {
        this.webviewView.webview.html = newHtml;
      }
    });
  }

  private async _getHtmlForWebview(): Promise<string> {
    const webviewDirname = 'webview';
    const scriptUri = this.webviewView?.webview.asWebviewUri(
      this.editorGateway.editor.Uri.joinPath(
        this.extensionUri,
        webviewDirname,
        'index.js'
      )
    );
    const styleVSCodeUri = this.webviewView?.webview.asWebviewUri(
      this.editorGateway.editor.Uri.joinPath(
        this.extensionUri,
        webviewDirname,
        'vscode.css'
      )
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <!--
        Use a content security policy to only allow loading images from https or from our extension directory,
        and only allow scripts that have a specific nonce.
      -->
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
        this.webviewView?.webview.cspSource
      }; script-src 'nonce-${nonce}';">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="${styleVSCodeUri}" rel="stylesheet">
      <title>Local CI License Key</title>
    </head>
    <body>
      ${await this.licensePresenter.getView(this.context)}
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}
