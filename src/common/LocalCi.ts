import type vscode from 'vscode';
import FsGateway from 'gateway/FsGateway';
import JobProviderFactory from 'job/JobProviderFactory';
import LicenseProviderFactory from 'license/LicenseProviderFactory';
import RegistrarFactory from './RegistrarFactory';
import ReporterGateway from 'gateway/ReporterGateway';
import { HOST_TMP_DIRECTORY } from 'constant';

export default class LocalCi {
  constructor(
    public fsGateway: FsGateway,
    public jobProviderFactory: JobProviderFactory,
    public licenseProviderFactory: LicenseProviderFactory,
    public registrarFactory: RegistrarFactory,
    public reporterGateway: ReporterGateway
  ) {}

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
