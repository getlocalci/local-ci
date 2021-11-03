export default function getImagefromJob(job: Job | undefined): string {
  if (job?.docker?.length) {
    return job.docker[0]?.image.trim();
  }

  if (job?.machine?.image) {
    return job.machine.image;
  }

  return '';
}
