import * as vscode from 'vscode';

export default async function showLogFile(logFilePath: string): Promise<void> {
  const doc = await vscode.workspace.openTextDocument(
    vscode.Uri.parse(`local-ci.log:${logFilePath}`)
  );
  await vscode.window.showTextDocument(doc, { preview: true });
}
