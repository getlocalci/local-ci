import * as vscode from 'vscode';
import getHomeDirectory from './getHomeDirectory';

export default function getProjectDirectory(imageId: string): string {
  if (!imageId) {
    return '/home/circleci/project';
  }

  try {
    return `${getHomeDirectory(imageId)}/project`;
  } catch (e) {
    vscode.window.showErrorMessage(
      `There was an error getting the default workspace: ${
        (e as ErrorWithMessage)?.message
      }`
    );

    return '';
  }
}
