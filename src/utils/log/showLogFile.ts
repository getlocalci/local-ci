import * as vscode from 'vscode';
import { LOG_FILE_SCHEME } from 'constants/';

export default async function showLogFile(logFilePath: string): Promise<void> {
  await vscode.window.showTextDocument(
    await vscode.workspace.openTextDocument(
      vscode.Uri.parse(`${LOG_FILE_SCHEME}:${logFilePath}`)
    )
  );
}
