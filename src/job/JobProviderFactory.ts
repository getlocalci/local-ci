import type vscode from 'vscode';
import AllConfigFiles from 'config/AllConfigFiles';
import AllJobs from './AllJobs';
import Children from './Children';
import CommandFactory from './ComandFactory';
import Config from 'config/Config';
import ConfigFile from 'config/ConfigFile';
import Docker from 'containerization/Docker';
import EditorGateway from 'gateway/EditorGateway';
import FsGateway from 'gateway/FsGateway';
import JobFactory from './JobFactory';
import JobProvider from './JobProvider';
import License from 'license/License';
import LogFactory from 'log/LogFactory';
import ReporterGateway from 'gateway/ReporterGateway';
import WarningFactory from './WarningFactory';
import Retryer from './Retryer';

export default class JobProviderFactory {
  constructor(
    public allConfigFiles: AllConfigFiles,
    public children: Children,
    public configFile: ConfigFile,
    public commandFactory: CommandFactory,
    public docker: Docker,
    public editorGateway: EditorGateway,
    public fsGateway: FsGateway,
    public license: License,
    public config: Config,
    public jobFactory: JobFactory,
    public logFactory: LogFactory,
    public reporterGateway: ReporterGateway,
    public retryer: Retryer,
    public warningFactory: WarningFactory,
    public allJobs: AllJobs
  ) {}

  create(
    context: vscode.ExtensionContext,
    jobDependencies?: Map<string, string[] | null>
  ) {
    return new JobProvider(
      context,
      this.reporterGateway,
      this.allConfigFiles,
      this.children,
      this.configFile,
      this.docker,
      this.editorGateway,
      this.fsGateway,
      this.license,
      this.config,
      this.retryer,
      this.allJobs,
      jobDependencies
    );
  }
}
