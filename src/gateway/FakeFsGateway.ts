export default class FakeFsGateway {
  fs = {
    existsSync: () => null,
    mkdirSync: () => null,
    readFileSync: () => null,
    rmSync: () => null,
    writeFileSync: () => null,
  };
}
