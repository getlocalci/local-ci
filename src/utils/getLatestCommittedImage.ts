import * as cp from 'child_process';
import getSpawnOptions from './getSpawnOptions';

export default function getLatestCommittedImage(
  committedImageName: string
): Promise<string> {
  const { stdout, stderr } = cp.spawn(
    '/bin/sh',
    [
      '-c',
      `docker images --filter reference=${committedImageName} --format "{{.ID}} {{.Tag}}" | sort -k 2 -h | tail -n1 | awk '{print $1}'`,
    ],
    getSpawnOptions()
  );

  return new Promise((resolve, reject) => {
    stdout.on('data', (data) => {
      resolve(data?.toString ? data.toString().trim() : '');
    });

    stderr.on('data', () => {
      reject('');
    });

    stderr.on('error', () => {
      reject('');
    });
  });
}
