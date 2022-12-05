import type vscode from 'vscode';
import FsGateway from 'gateway/FsGateway';

export default class LogProvider implements vscode.TextDocumentContentProvider {
  constructor(private fsGateway: FsGateway) {}

  provideTextDocumentContent(uri: vscode.Uri): string {
    return this.fsGateway.fs.readFileSync(uri.fsPath, 'utf8');
  }
}
