import { TRIAL_LENGTH_IN_MILLISECONDS } from '../constants';

export default function getMillisecondsRemainingInTrial(
  currentTimeStamp: number,
  trialStartedTimeStamp: number | unknown
): number {
  const previewTimeElapsed = currentTimeStamp - Number(trialStartedTimeStamp);

  return trialStartedTimeStamp
    ? TRIAL_LENGTH_IN_MILLISECONDS - previewTimeElapsed
    : 0;
}
