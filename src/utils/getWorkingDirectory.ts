import * as path from 'path';
import * as vscode from 'vscode';
import getHomeDirectory from './getHomeDirectory';

export default async function getWorkingDirectory(
  imageId: string,
  terminal?: vscode.Terminal
): Promise<string> {
  const defaultDirectory = '/home/circleci/project';
  if (!imageId) {
    return Promise.resolve(defaultDirectory);
  }

  try {
    return path.join(await getHomeDirectory(imageId, terminal), 'project');
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error getting the project directory: ${
        (e as ErrorWithMessage)?.message
      }`
    );

    return defaultDirectory;
  }
}
