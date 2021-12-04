const minuteInMilliseconds = 60000;
const hourInMilliseconds = 3600000;
const dayInMilliseconds = 86400000;

function getTextForNumber(singular: string, plural: string, count: number) {
  if (!count) {
    return '';
  }

  return count === 1 ? singular : plural;
}

export default function getPrettyPrintedTimeRemaining(
  millisecondsRemaining: number
): string {
  const defaultTime = 'No time';
  if (millisecondsRemaining < minuteInMilliseconds) {
    return defaultTime;
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

  const daysRemaining = Math.round(millisecondsRemaining / dayInMilliseconds);
  const hoursRemaining = Math.floor(
    Math.max(
      (millisecondsRemaining - daysRemaining * dayInMilliseconds) /
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
