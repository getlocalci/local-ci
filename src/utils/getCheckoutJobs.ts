import getConfig from './getConfig';

// Gets the names of the jobs that have a 'checkout' step.
export default function getCheckoutJobs(inputFile: string): string[] {
  const config = getConfig(inputFile);

  return Object.keys(config?.jobs ?? []).filter((jobName) =>
    config?.jobs[jobName]?.steps?.some(
      (step: Step) => 'checkout' === step || step.checkout
    )
  );
}
