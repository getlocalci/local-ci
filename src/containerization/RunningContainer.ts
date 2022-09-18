import { inject, injectable } from 'inversify';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import Spawn from 'common/Spawn';
import Types from 'common/Types';
import { commitContainer, getRunningContainerFunction } from 'script';

@injectable()
export default class RunningContainer {
  @inject(Spawn)
  spawn!: Spawn;

  @inject(Types.IChildProcessGateway)
  childProcessGateway!: ChildProcessGateway;

  /**
   * Commits the latest container so that this can open an interactive session when it finishes.
   *
   * Containers exit when they finish.
   * So this creates an alternative container for shell access.
   * This starts by removing previous images of the same repo, as images can be 1-2 GB each.
   * The while loop has a [ true ] condition because runJob()
   * ends this process with .kill().
   */
  commit(dockerImage: string, imageRepo: string) {
    return this.childProcessGateway.cp.spawn(
      '/bin/sh',
      [
        '-c',
        `${getRunningContainerFunction}
        docker_image=${dockerImage}
        image_repo=${imageRepo}
        ${commitContainer}`,
      ],
      this.spawn.getOptions()
    );
  }
}
