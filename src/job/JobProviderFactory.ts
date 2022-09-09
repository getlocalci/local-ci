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
import JobProvider from './JobProvider';
import AllJobs from './AllJobs';

export default function JobProviderFactory(iocContext: IocContext) {
  return (
    context: vscode.ExtensionContext,
    reporter: TelemetryReporter,
    jobDependencies?: Map<string, string[] | null>
  ) => {
    return new JobProvider(
      context,
      reporter,
      iocContext.container.get(AllConfigFiles),
      iocContext.container.get(ConfigFile),
      iocContext.container.get(CommandFactory),
      iocContext.container.get(Docker),
      iocContext.container.get(Types.IEditorGateway),
      iocContext.container.get(Types.IFsGateway),
      iocContext.container.get(License),
      iocContext.container.get(Config),
      iocContext.container.get(JobFactory),
      iocContext.container.get(LogFactory),
      iocContext.container.get(WarningFactory),
      iocContext.container.get(AllJobs),
      jobDependencies
    );
  };
}
