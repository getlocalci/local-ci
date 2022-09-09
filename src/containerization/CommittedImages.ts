import { inject, injectable } from 'inversify';
import Spawn from 'common/Spawn';
import Types from 'common/Types';
import ChildProcessGateway from 'common/ChildProcessGateway';

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
        `LOCAL_CI_IMAGES=$(docker images -q ${imagePattern})
        echo $LOCAL_CI_IMAGES | while read image
          do
          if [ ${imageIdToExclude} = $image ]
            then
            continue
          fi
          LOCAL_CI_CONTAINERS=$(docker ps --filter ancestor=$image -q)
          if [ -n "$LOCAL_CI_CONTAINERS" ]
            then
            docker stop $LOCAL_CI_CONTAINERS
            docker rm $LOCAL_CI_CONTAINERS
          fi
        done
        docker rmi $LOCAL_CI_IMAGES`,
      ],
      this.spawn.getOptions()
    );
  }
}
