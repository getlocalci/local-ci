export default function getImagefromJob(job: Job | undefined): string {
  return job?.docker?.length ? job.docker[0]?.image.trim() : '';
}
