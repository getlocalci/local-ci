export default class FakeChildProcessGateway {
  cp = {
    spawn: () => null,
    spawnSync: () => null,
  };
}
