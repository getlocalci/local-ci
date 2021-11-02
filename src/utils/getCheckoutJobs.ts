import getConfigFromPath from './getConfigFromPath';

// Gets the names of the jobs that have a 'checkout' step.
export default function getCheckoutJobs(configFilePath: string): string[] {
  const config = getConfigFromPath(configFilePath);

  return Object.keys(config?.jobs ?? []).filter((jobName) =>
    config?.jobs[jobName]?.steps?.some(
      (step: Step) => 'checkout' === step || step.checkout
    )
  );
}
