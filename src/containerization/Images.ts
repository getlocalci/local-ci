import ChildProcessGateway from 'gateway/ChildProcessGateway';
import Spawn from 'common/Spawn';
import { cleanUpImages } from 'script';

export default class Images {
  constructor(
    public childProcessGateway: ChildProcessGateway,
    public spawn: Spawn
  ) {}

  cleanUp(imagePattern: string, imageIdToExclude?: string): void {
    this.childProcessGateway.cp.spawn(
      '/bin/sh',
      [
        '-c',
        `lci_image_pattern=${imagePattern}
        lci_image_to_exclude=${imageIdToExclude}
        ${cleanUpImages}`,
      ],
      this.spawn.getOptions()
    );
  }
}
