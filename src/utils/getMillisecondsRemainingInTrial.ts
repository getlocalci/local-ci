export default function getMillisecondsRemainingInTrial(
  currentTimeStamp: number,
  trialStartedTimeStamp: number | unknown,
  trialLengthInMilliseconds: number
): number {
  const previewTimeElapsed = currentTimeStamp - Number(trialStartedTimeStamp);

  return trialStartedTimeStamp
    ? trialLengthInMilliseconds - previewTimeElapsed
    : 0;
}
