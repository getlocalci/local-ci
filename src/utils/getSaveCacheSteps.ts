export default function getSaveCacheSteps(
  config: CiConfig
): (SaveCache | undefined)[] {
  const saveCacheSteps = [];
  for (const jobName in config?.jobs) {
    const job = config?.jobs[jobName];
    for (const stepIndex in job?.steps) {
      const step = job?.steps[stepIndex];
      if (
        step &&
        typeof step !== 'string' &&
        Object.keys(step).some((stepName) => stepName === 'save_cache')
      ) {
        saveCacheSteps.push(step?.save_cache);
      }
    }
  }

  return saveCacheSteps;
}
