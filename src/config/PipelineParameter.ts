import FsGateway from 'gateway/FsGateway';

export default class PipelineParameter {
  constructor(public fsGateway: FsGateway) {}

  replace(parametersPath: string, configFilePath: string): void {
    if (
      !this.fsGateway.fs.existsSync(configFilePath) ||
      !this.fsGateway.fs.existsSync(parametersPath)
    ) {
      return;
    }

    let parameters: Record<string, string>;
    try {
      parameters = JSON.parse(
        this.fsGateway.fs.readFileSync(parametersPath, 'utf-8')
      );
    } catch (e) {
      return;
    }

    this.fsGateway.fs.writeFileSync(
      configFilePath,
      Object.keys(parameters).reduce(
        (accumulator, parameterName) =>
          accumulator.replace(
            `<< pipeline.parameters.${parameterName} >>`,
            String(parameters[parameterName])
          ),
        this.fsGateway.fs.readFileSync(configFilePath, 'utf8')
      )
    );
  }
}
