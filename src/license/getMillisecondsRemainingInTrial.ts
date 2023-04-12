export default function getMillisecondsRemainingInTrial(
  currentTimeStamp: number,
  trialStartedTimeStamp: number | unknown,
  trialLengthInMilliseconds: number
): number {
  const trialTimeElapsed = currentTimeStamp - Number(trialStartedTimeStamp);

  return trialStartedTimeStamp
    ? trialLengthInMilliseconds - trialTimeElapsed
    : 0;
}
