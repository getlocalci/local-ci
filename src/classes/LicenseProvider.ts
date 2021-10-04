import * as vscode from 'vscode';
import getLicenseInformation from '../utils/getLicenseInformation';
import showLicenseInput from '../utils/showLicenseInput';

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

  constructor(private readonly context: vscode.ExtensionContext) {
    this.extensionUri = context.extensionUri;
  }

  async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
    this.webviewView = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    await this.load();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.type === 'enterLicense') {
        await showLicenseInput(this.context);
        await this.load();
      }
    });
  }

  async load(): Promise<void> {
    if (!this.webviewView) {
      return;
    }

    this._getHtmlForWebview(this.webviewView.webview).then((newHtml) => {
      if (this.webviewView?.webview?.html) {
        this.webviewView.webview.html = newHtml;
      }
    });
  }

  private async _getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    const webviewDirname = 'webview';
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'src', webviewDirname, 'index.js')
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
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
      ${await getLicenseInformation(this.context)}
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}
