const minuteInMilliseconds = 60000;
const hourInMilliseconds = 3600000;
const dayInMilliseconds = 86400000;

function getTextForNumber(singular: string, plural: string, count: number) {
  return count === 1 ? singular : plural;
}

export default function getPrettyPrintedTimeRemaining(
  millisecondsRemaining: number
): string {
  const defaultTime = 'No time';
  if (millisecondsRemaining <= 0) {
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

  if (millisecondsRemaining < dayInMilliseconds) {
    const hoursRemaining = Math.floor(
      millisecondsRemaining / hourInMilliseconds
    );

    return getTextForNumber(
      `${hoursRemaining} hour`,
      `${hoursRemaining} hours`,
      hoursRemaining
    );
  }

  const daysRemaining = Math.floor(millisecondsRemaining / dayInMilliseconds);

  return getTextForNumber(
    `${daysRemaining} day`,
    `${daysRemaining} days`,
    daysRemaining
  );
}
