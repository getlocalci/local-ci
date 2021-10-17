import { TRIAL_LENGTH_IN_MILLISECONDS } from '../constants';

export default function isPreviewExpired(
  trialStartedTimeStamp: number | unknown
): boolean {
  return (
    !trialStartedTimeStamp ||
    new Date().getTime() - Number(trialStartedTimeStamp) >
      TRIAL_LENGTH_IN_MILLISECONDS
  );
}
