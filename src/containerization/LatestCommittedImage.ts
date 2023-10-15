import ChildProcessGateway from 'gateway/ChildProcessGateway';
import Spawn from 'common/Spawn';

export default class LatestCommittedImage {
  constructor(
    public spawn: Spawn,
    public childProcessGateway: ChildProcessGateway
  ) {}

  get(committedImageName: string): Promise<string> {
    const { stdout, stderr } = this.childProcessGateway.cp.spawn(
      '/bin/sh',
      [
        '-c',
        `docker images ${committedImageName} --format "{{.ID}} {{.Tag}}" | sort -k 2 -h | tail -n1 | awk '{print $1}'`,
      ],
      {
        ...this.spawn.getOptions(),
        timeout: 5000,
      }
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
}
