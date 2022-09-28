import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import Types from './Types';
import FsGateway from 'gateway/FsGateway';
import JobProviderFactory from 'job/JobProviderFactory';
import LicenseProviderFactory from 'license/LicenseProviderFactory';
import RegistrarFactory from './RegistrarFactory';
import ReporterGateway from 'gateway/ReporterGateway';
import { HOST_TMP_DIRECTORY, JOB_TREE_VIEW_ID } from 'constant';
import EditorGateway from 'gateway/EditorGateway';

@injectable()
export default class LocalCi {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

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
    jobProvider.init().then(() => {
      this.editorGateway.editor.window.registerTreeDataProvider(
        JOB_TREE_VIEW_ID,
        jobProvider
      );
    });

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
