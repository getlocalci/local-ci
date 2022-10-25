export default function getJobs(
  config: CiConfig
): Map<string, string[] | null> {
  const allJobs = new Map();

  if (config && Object.values(config?.workflows)?.length) {
    for (const workflowName in config?.workflows) {
      const workflow = config.workflows[workflowName];
      if (!workflow?.jobs) {
        continue;
      }

      for (const job of workflow.jobs) {
        if (typeof job === 'string') {
          allJobs.set(job, null);
          continue;
        }

        const jobName = Object.keys(job).length ? Object.keys(job)[0] : null;
        if (!jobName) {
          continue;
        }

        const jobConfig = Object.values(job).length
          ? Object.values(job)[0]
          : null;

        if (typeof jobConfig !== 'string') {
          allJobs.set(jobName, jobConfig?.requires);
        }
      }
    }
  }

  return allJobs;
}
