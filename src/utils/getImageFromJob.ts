export default function getImagefromJob(job: Job): string {
  return job?.docker && job?.docker?.length ? job.docker[0]?.image : '';
}
