import getMillisecondsRemainingInTrial from './getMillisecondsRemainingInTrial';

export default function isTrialExpired(
  trialStartedTimeStamp: number | unknown,
  trialLengthInMilliseconds: number
): boolean {
  return (
    !trialStartedTimeStamp ||
    getMillisecondsRemainingInTrial(
      new Date().getTime(),
      trialStartedTimeStamp,
      trialLengthInMilliseconds
    ) <= 0
  );
}
