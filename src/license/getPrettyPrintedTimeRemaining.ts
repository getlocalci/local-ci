import { DAY_IN_MILLISECONDS } from 'constant';

const minuteInMilliseconds = 60000;
const hourInMilliseconds = 3600000;

function getTextForNumber(singular: string, plural: string, count: number) {
  if (!count) {
    return '';
  }

  return count === 1 ? singular : plural;
}

export default function getPrettyPrintedTimeRemaining(
  millisecondsRemaining: number
): string {
  if (millisecondsRemaining < minuteInMilliseconds) {
    return 'No time';
  }

  if (millisecondsRemaining < hourInMilliseconds) {
    const minutesRemaining = Math.floor(
      millisecondsRemaining / minuteInMilliseconds
    );

    return getTextForNumber(
      `${minutesRemaining} minute`,
      `${minutesRemaining} minutes`,
      minutesRemaining
    );
  }

  const daysRemaining = Math.round(millisecondsRemaining / DAY_IN_MILLISECONDS);
  const hoursRemaining = Math.floor(
    Math.max(
      (millisecondsRemaining - daysRemaining * DAY_IN_MILLISECONDS) /
        hourInMilliseconds,
      0
    )
  );

  return [
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
    .filter((timeRemaining) => timeRemaining)
    .join(', ');
}
