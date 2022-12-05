/** Gets the names of the jobs that have a 'checkout' step. */
export default function getCheckoutJobs(config: CiConfig): string[] {
  return Object.keys(config?.jobs ?? []).filter((jobName) =>
    (config?.jobs ?? {})[jobName]?.steps?.some(
      (step: Step) => 'checkout' === step || (step as FullStep)?.checkout
    )
  );
}
