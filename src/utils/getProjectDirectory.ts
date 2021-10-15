import * as vscode from 'vscode';
import addTrailingSlash from './addTrailingSlash';
import getHomeDirectory from './getHomeDirectory';

export default async function getProjectDirectory(
  imageId: string,
  terminal?: vscode.Terminal
): Promise<string> {
  if (!imageId) {
    return '/home/circleci/project';
  }

  try {
    return `${addTrailingSlash(
      await getHomeDirectory(imageId, terminal)
    )}project`;
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error getting the default workspace: ${
        (e as ErrorWithMessage)?.message
      }`
    );

    return '';
  }
}
