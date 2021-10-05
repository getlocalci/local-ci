import getConfigFile from './getConfigFile';

// Gets the names of the jobs that have a 'checkout' step.
export default function getCheckoutJobs(inputFile: string): string[] {
  const configFile = getConfigFile(inputFile);

  return Object.keys(configFile?.jobs ?? []).filter((jobName) =>
    configFile.jobs[jobName]?.steps?.some(
      (step: Step) => 'checkout' === step || step.checkout
    )
  );
}
