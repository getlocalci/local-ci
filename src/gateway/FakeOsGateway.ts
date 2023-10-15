/** Stub class for operating system. */
export default class FakeOsGateway {
  os = {
    arch: () => '',
    platform: () => '',
    type: () => '',
  };
}
