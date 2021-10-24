import * as cp from 'child_process';
import * as vscode from 'vscode';
import {
  GET_CONTAINER_FUNCTION,
  GET_LATEST_COMMITTED_IMAGE_FUNCTION,
} from '../constants';
import getSpawnOptions from './getSpawnOptions';

export default function showHelperMessages(imageId: string): void {
  const trivialMessages = [
    '_XSERVTransmkdir',
    'Server is already active for display',
  ];

  const { stdout } = cp.spawn(
    '/bin/sh',
    [
      '-c',
      `${GET_LATEST_COMMITTED_IMAGE_FUNCTION}
      ${GET_CONTAINER_FUNCTION}
      docker logs $(get_container $(get_latest_committed_image ${imageId}))`,
    ],
    getSpawnOptions()
  );

  stdout.on('data', (data) => {
    if (
      data?.toString &&
      trivialMessages.some((message) => data.toString().includes(message))
    ) {
      vscode.window.showInformationMessage(
        `👈 If you click return in the terminal, you should be able to debug this`
      );
    }
  });
}
