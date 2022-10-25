import Types from 'common/Types';
import getLocalVolumePath from 'containerization/getLocalVolumePath';
import FsGateway from 'gateway/FsGateway';
import { inject, injectable } from 'inversify';
import ConfigFile from '../config/ConfigFile';
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

    const files = this.fsGateway.fs.readdirSync(localConfigFile);
    return !files.some((file) => {
      return file !== DYNAMIC_CONFIG_FILE_NAME;
    });
  }
}
