export default class FakeReporterGateway {
  reporter = {
    sendTelemetryEvent: () => null,
  };
}
