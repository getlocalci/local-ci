import { inject, injectable } from 'inversify';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import Spawn from 'common/Spawn';
import Types from 'common/Types';
import { cleanUpCommittedImages } from 'script';

@injectable()
export default class CommittedImages {
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
        ${ imageIdToExclude ? `lci_image_to_exclude=${imageIdToExclude}` : '' }
        ${cleanUpCommittedImages}`,
      ],
      this.spawn.getOptions()
    );
  }
}
