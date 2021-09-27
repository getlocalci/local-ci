import * as vscode from 'vscode';
import getLicenseInformation from './utils/getLicenseInformation';
import showLicenseInput from './utils/showLicenseInput';

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
  private _view?: vscode.WebviewView;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly _extensionUri: vscode.Uri
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.type === 'enterLicense') {
        await showLicenseInput(this.context);
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const webviewDirname = 'webview';
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'src', webviewDirname, 'index.js')
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'src',
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
        webview.cspSource
      }; script-src 'nonce-${nonce}';">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="${styleVSCodeUri}" rel="stylesheet">
      <title>Local CI License Key</title>
    </head>
    <body>
      ${getLicenseInformation(this.context)}
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}
