import TelemetryReporter from '@vscode/extension-telemetry';
import { TELEMETRY_KEY } from 'constant';

export default class ReporterGateway {
  reporter: TelemetryReporter;

  constructor() {
    this.reporter = new TelemetryReporter(TELEMETRY_KEY);
  }
}
