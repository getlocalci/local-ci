import * as vscode from 'vscode';
import Types from 'common/Types';
import AllConfigFiles from 'config/AllConfigFiles';
import Config from 'config/Config';
import ConfigFile from 'config/ConfigFile';
import Docker from 'containerization/Docker';
import License from 'license/License';
import LogFactory from 'log/LogFactory';
import CommandFactory from './ComandFactory';
import JobFactory from './JobFactory';
import WarningFactory from './WarningFactory';
import TelemetryReporter from '@vscode/extension-telemetry';
import AllJobs from './AllJobs';
import { inject, injectable } from 'inversify';
import FsGateway from 'common/FsGateway';
import EditorGateway from 'common/EditorGateway';
import JobProvider from './JobProvider';

@injectable()
export default class JobProviderFactory {
  @inject(AllConfigFiles)
  allConfigFiles!: AllConfigFiles;

  @inject(ConfigFile)
  configFile!: ConfigFile;

  @inject(CommandFactory)
  commandFactory!: CommandFactory;

  @inject(Docker)
  docker!: Docker;

  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(Types.IFsGateway)
  fsGateway!: FsGateway;

  @inject(License)
  license!: License;

  @inject(Config)
  config!: Config;

  @inject(JobFactory)
  jobFactory!: JobFactory;

  @inject(LogFactory)
  logFactory!: LogFactory;

  @inject(WarningFactory)
  warningFactory!: WarningFactory;

  @inject(AllJobs)
  allJobs!: AllJobs;

  create(
    context: vscode.ExtensionContext,
    reporter: TelemetryReporter,
    jobDependencies?: Map<string, string[] | null>
  ) {
    return new JobProvider(
      context,
      reporter,
      this.allConfigFiles,
      this.configFile,
      this.commandFactory,
      this.docker,
      this.editorGateway,
      this.fsGateway,
      this.license,
      this.config,
      this.jobFactory,
      this.logFactory,
      this.warningFactory,
      this.allJobs,
      jobDependencies
    );
  }
}
