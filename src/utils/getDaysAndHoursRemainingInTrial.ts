import getMillisecondsRemainingInTrial from './getMillisecondsRemainingInTrial';
import getPrettyPrintedTimeRemaining from './getPrettyPrintedTimeRemaining';

export default function getDaysAndHoursRemainingInTrial(
  currentTimeStamp: number,
  trialStartedTimeStamp: number | unknown,
  trialLengthInMilliseconds: number
): string {
  return getPrettyPrintedTimeRemaining(
    getMillisecondsRemainingInTrial(
      currentTimeStamp,
      trialStartedTimeStamp,
      trialLengthInMilliseconds
    )
  );
}
