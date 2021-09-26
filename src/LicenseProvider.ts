import * as vscode from 'vscode';

export default class LicenseProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'localCiLicense';
  private _view?: vscode.WebviewView;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly _extensionUri: vscode.Uri
  ) {}

  // eslint-disable-next-line prettier/prettier
  resolveWebviewView(
    webviewView: vscode.WebviewView,
  ): void | Thenable<void> {
    this._view = webviewView;
    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview();
  }
  private _getHtmlForWebview() {
    // Use a nonce to only allow a specific script to be run.
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>License Key</title>
      </head>
      <body>
      <div class="button-container">
        <a class="monaco-button monaco-text-button" tabindex="0" role="button" style="color: rgb(255, 255, 255); background-color: rgb(14, 99, 156);">
          Get Key
        </a>
      </div>
      </body>
      </html>`;
  }
}
