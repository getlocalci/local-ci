import { DAY_IN_MILLISECONDS, TRIAL_LENGTH_IN_MILLISECONDS } from 'constant';
import getMillisecondsRemainingInTrial from 'license/getMillisecondsRemainingInTrial';

const hourInMilliseconds = 3600000;

describe('getMillisecondsRemainingInTrial', () => {
  test('entire trial remaining', () => {
    const time = new Date().getTime();
    expect(
      getMillisecondsRemainingInTrial(time, time, TRIAL_LENGTH_IN_MILLISECONDS)
    ).toEqual(TRIAL_LENGTH_IN_MILLISECONDS);
  });

  test('1 day remaining', () => {
    const time = new Date().getTime();
    expect(
      getMillisecondsRemainingInTrial(
        time,
        time - 24 * hourInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      )
    ).toEqual(29 * DAY_IN_MILLISECONDS);
  });

  test('1 hour remaining', () => {
    const time = new Date().getTime();
    expect(
      getMillisecondsRemainingInTrial(
        time,
        time - (29 * DAY_IN_MILLISECONDS + 23 * hourInMilliseconds),
        TRIAL_LENGTH_IN_MILLISECONDS
      )
    ).toEqual(hourInMilliseconds);
  });

  test('no time remaining', () => {
    const time = new Date().getTime();
    expect(
      getMillisecondsRemainingInTrial(
        time,
        time - 30 * DAY_IN_MILLISECONDS,
        TRIAL_LENGTH_IN_MILLISECONDS
      )
    ).toEqual(0);
  });
});
