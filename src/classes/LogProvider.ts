import * as fs from 'fs';
import * as vscode from 'vscode';

export default class LogProvider implements vscode.TextDocumentContentProvider {
  provideTextDocumentContent(uri: vscode.Uri): string {
    return fs.readFileSync(uri.fsPath, 'utf8');
  }
}
