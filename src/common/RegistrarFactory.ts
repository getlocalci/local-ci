import EnterToken from 'command/EnterToken';
import ExitAllJobs from 'command/ExitAllJobs';
import SelectRepo from 'command/SelectRepo';
import EditorGateway from 'common/EditorGateway';
import Types from 'common/Types';
import { inject, injectable } from 'inversify';
import JobProvider from 'job/JobProvider';
import type vscode from 'vscode';
import Refresh from '../command/Refresh';
import TryProcessAgain from '../command/TryProcessAgain';
import LicenseProvider from 'license/LicenseProvider';
import Registrar from './Registrar';
import RunJob from 'command/RunJob';
import ExitJob from 'command/ExitJob';

@injectable()
export default class RegistrarFactory {
  constructor(
    @inject(Types.IEditorGateway) private editorGateway: EditorGateway,
    @inject(EnterToken) private enterToken: EnterToken,
    @inject(ExitAllJobs) private exitAllJobs: ExitAllJobs,
    @inject(ExitJob) private exitJob: ExitJob,
    @inject(Refresh) private refresh: Refresh,
    @inject(RunJob) private runJob: RunJob,
    @inject(SelectRepo) private selectRepo: SelectRepo,
    @inject(TryProcessAgain) private tryProcessAgain: TryProcessAgain
  ) {}

  create(
    context: vscode.ExtensionContext,
    jobProvider: JobProvider,
    licenseProvider: LicenseProvider
  ) {
    return new Registrar(
      context,
      jobProvider,
      licenseProvider,
      this.editorGateway,
      this.enterToken,
      this.exitAllJobs,
      this.exitJob,
      this.refresh,
      this.runJob,
      this.selectRepo,
      this.tryProcessAgain
    );
  }
}
