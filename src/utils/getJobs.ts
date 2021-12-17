import getConfig from './getConfig';

export default function getJobs(
  processedConfig: string
): Map<string, string[] | null> {
  const config = getConfig(processedConfig);
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
        }

        const jobName = Object.keys(job).length ? Object.keys(job)[0] : null;
        if (!jobName) {
          continue;
        }

        const jobConfig = Object.values(job).length
          ? Object.values(job)[0]
          : null;
        allJobs.set(jobName, jobConfig?.requires);
      }
    }
  }

  return allJobs;
}
