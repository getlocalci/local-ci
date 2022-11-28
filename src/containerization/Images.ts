import { inject, injectable } from 'inversify';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import Spawn from 'common/Spawn';
import Types from 'common/Types';
import { cleanUpImages } from 'script';

@injectable()
export default class Images {
  @inject(Types.IChildProcessGateway)
  childProcessGateway!: ChildProcessGateway;

  @inject(Spawn)
  spawn!: Spawn;

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
