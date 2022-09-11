import * as vscode from 'vscode';
import { injectable } from 'inversify';

import TelemetryReporter from '@vscode/extension-telemetry';
import { EXTENSION_ID, TELEMETRY_KEY } from 'constants/';

@injectable()
export default class ReporterGateway {
  reporter: TelemetryReporter;

  constructor() {
    this.reporter = new TelemetryReporter(
      EXTENSION_ID,
      vscode.extensions.getExtension(EXTENSION_ID)?.packageJSON.version,
      TELEMETRY_KEY
    );
  }
}
