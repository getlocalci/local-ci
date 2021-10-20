import * as vscode from 'vscode';
import addTrailingSlash from './addTrailingSlash';
import getHomeDirectory from './getHomeDirectory';

export default async function getProjectDirectory(
  imageId: string,
  terminal?: vscode.Terminal
): Promise<string> {
  const defaultDirectory = '/home/circleci/project';
  if (!imageId) {
    return defaultDirectory;
  }

  try {
    return `${addTrailingSlash(
      await getHomeDirectory(imageId, terminal)
    )}project`;
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error getting the project directory: ${
        (e as ErrorWithMessage)?.message
      }`
    );

    return defaultDirectory;
  }
}
