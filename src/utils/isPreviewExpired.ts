import { PREVIEW_LENGTH_IN_MILLISECONDS } from '../constants';

export default function isPreviewExpired(
  trialStartedTimeStamp: number | unknown
): boolean {
  return (
    !trialStartedTimeStamp ||
    new Date().getTime() - Number(trialStartedTimeStamp) >
      PREVIEW_LENGTH_IN_MILLISECONDS
  );
}
