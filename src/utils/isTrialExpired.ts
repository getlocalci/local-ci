import { TRIAL_LENGTH_IN_MILLISECONDS } from '../constants';

export default function isTrialExpired(
  trialStartedTimeStamp: number | unknown
): boolean {
  return (
    !trialStartedTimeStamp ||
    new Date().getTime() - Number(trialStartedTimeStamp) >
      TRIAL_LENGTH_IN_MILLISECONDS
  );
}
