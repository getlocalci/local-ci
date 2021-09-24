import { PREVIEW_LENGTH_IN_MILLISECONDS } from '../constants';
const hourInMilliseconds = 3600000;

export default function getHoursRemainingInPreview(
  trialStartedTimeStamp: number | unknown
): number {
  const previewTimeElapsed =
    new Date().getTime() - Number(trialStartedTimeStamp);

  return trialStartedTimeStamp
    ? Math.ceil(
        (PREVIEW_LENGTH_IN_MILLISECONDS - previewTimeElapsed) /
          hourInMilliseconds
      )
    : 0;
}
