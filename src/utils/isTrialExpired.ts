import { TRIAL_LENGTH_IN_MILLISECONDS } from '../constants';
import getMillisecondsRemainingInTrial from './getMillisecondsRemainingInTrial';

export default function isTrialExpired(
  trialStartedTimeStamp: number | unknown
): boolean {
  return (
    !trialStartedTimeStamp ||
    getMillisecondsRemainingInTrial(
      new Date().getTime(),
      trialStartedTimeStamp
    ) < TRIAL_LENGTH_IN_MILLISECONDS
  );
}
