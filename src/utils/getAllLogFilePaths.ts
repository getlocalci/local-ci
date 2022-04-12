import * as vscode from 'vscode';
import * as path from 'path';
import { HOST_TMP_DIRECTORY } from '../constants';
import getRepoPath from './getRepoPath';

export default async function getAllLogFilePaths(
  jobName: string,
  fullPathToConfigFile: string
): Promise<vscode.Uri[]> {
  return await vscode.workspace.findFiles(
    `**/${path.join(
      HOST_TMP_DIRECTORY,
      getRepoPath(fullPathToConfigFile),
      'logs',
      jobName)}/**`
  );
}
