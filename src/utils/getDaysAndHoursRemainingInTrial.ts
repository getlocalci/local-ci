import getMillisecondsRemainingInTrial from './getMillisecondsRemainingInTrial';
const hourInMilliseconds = 3600000;
const dayInMilliseconds = 86400000;

function getTextForNumber(singular: string, plural: string, count: number) {
  if (!count) {
    return '';
  }

  return count === 1 ? singular : plural;
}

export default function getDaysAndHoursRemainingInTrial(
  currentTimeStamp: number,
  trialStartedTimeStamp: number | unknown
): string {
  const defaultTime = 'No time';
  if (!trialStartedTimeStamp) {
    return defaultTime;
  }

  const millisecondsRemainingInTrial = getMillisecondsRemainingInTrial(
    currentTimeStamp,
    trialStartedTimeStamp
  );
  const daysRemaining = Math.floor(
    millisecondsRemainingInTrial / dayInMilliseconds
  );
  const hoursRemaining = Math.ceil(
    (millisecondsRemainingInTrial % dayInMilliseconds) / hourInMilliseconds
  );

  return millisecondsRemainingInTrial > 0
    ? [
        getTextForNumber(
          `${daysRemaining} day`,
          `${daysRemaining} days`,
          daysRemaining
        ),
        getTextForNumber(
          `${hoursRemaining} hour`,
          `${hoursRemaining} hours`,
          hoursRemaining
        ),
      ]
        .filter((text) => text)
        .join(', ')
    : defaultTime;
}
