import { inject, injectable } from 'inversify';
import { HOST_TMP_DIRECTORY } from 'constants/';
import JobProviderFactory from 'job/JobProviderFactory';
import LicenseProviderFactory from 'license/LicenseProviderFactory';
import type vscode from 'vscode';
import FsGateway from 'gateway/FsGateway';
import RegistrarFactory from './RegistrarFactory';
import ReporterGateway from 'gateway/ReporterGateway';
import Types from './Types';

@injectable()
export default class LocalCi {
  @inject(Types.IFsGateway)
  fsGateway!: FsGateway;

  @inject(JobProviderFactory)
  jobProviderFactory!: JobProviderFactory;

  @inject(LicenseProviderFactory)
  licenseProviderFactory!: LicenseProviderFactory;

  @inject(RegistrarFactory)
  registrarFactory!: RegistrarFactory;

  @inject(Types.IReporterGateway)
  reporterGateway!: ReporterGateway;

  activate(context: vscode.ExtensionContext) {
    this.reporterGateway.reporter.sendTelemetryEvent('activate');
    const jobProvider = this.jobProviderFactory.create(context);
    jobProvider.init();

    const licenseProvider = this.licenseProviderFactory.create(context, () =>
      jobProvider.hardRefresh()
    );
    const registrar = this.registrarFactory.create(
      context,
      jobProvider,
      licenseProvider
    );

    registrar.registerHandlers();
    context.subscriptions.push(
      ...registrar.registerCommands(),
      ...registrar.registerProviders(),
      this.reporterGateway.reporter
    );
  }

  deactivate() {
    this.reporterGateway.reporter.sendTelemetryEvent('deactivate');
    this.fsGateway.fs.rmSync(HOST_TMP_DIRECTORY, {
      recursive: true,
      force: true,
    });
  }
}
