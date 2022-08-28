import * as fs from 'fs';

export default function applyPipelineParameters(
  parametersPath: string,
  configFilePath: string
): void {
  if (!fs.existsSync(configFilePath) || !fs.existsSync(parametersPath)) {
    return;
  }

  let parameters: Record<string, string>;
  try {
    parameters = JSON.parse(fs.readFileSync(parametersPath, 'utf-8'));
  } catch (e) {
    return;
  }

  fs.writeFileSync(
    configFilePath,
    Object.keys(parameters).reduce(
      (accumulator, parameterName) =>
        accumulator.replace(
          `<< pipeline.parameters.${parameterName} >>`,
          String(parameters[parameterName])
        ),
      fs.readFileSync(configFilePath, 'utf8')
    )
  );
}
