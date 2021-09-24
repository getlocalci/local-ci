const hourInMilliseconds = 3600000;

export default function getHoursRemainingInPreview(
  trialStartedTimeStamp: number | unknown
): number {
  return trialStartedTimeStamp
    ? Math.ceil(
        (new Date().getTime() - Number(trialStartedTimeStamp)) /
          hourInMilliseconds
      )
    : 0;
}
