import { injectable } from 'inversify';

@injectable()
export default class FakeReporterGateway {
  reporter = {
    sendTelemetryEvent: () => null,
  };
}
