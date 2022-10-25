import { inject, injectable } from 'inversify';
import Types from 'common/Types';
import ConfigFile from '../config/ConfigFile';
import FsGateway from 'gateway/FsGateway';
import getLocalVolumePath from 'containerization/getLocalVolumePath';
import { DYNAMIC_CONFIG_FILE_NAME } from 'constant';

@injectable()
export default class Volume {
  @inject(Types.IFsGateway)
  fsGateway!: FsGateway;

  @inject(ConfigFile)
  configFile!: ConfigFile;

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
