import FsGateway from 'gateway/FsGateway';
import getLocalVolumePath from 'containerization/getLocalVolumePath';
import { DYNAMIC_CONFIG_FILE_NAME } from 'constant';

export default class Volume {
  constructor(public fsGateway: FsGateway) {}

  isEmpty(configFilePath: string): boolean {
    const localConfigFile = getLocalVolumePath(configFilePath);
    if (!this.fsGateway.fs.existsSync(localConfigFile)) {
      return true;
    }

    return !this.fsGateway.fs.readdirSync(localConfigFile).some((file) => {
      return file !== DYNAMIC_CONFIG_FILE_NAME;
    });
  }
}
