import getTimeRemainingInTrial from 'license/getTimeRemainingInTrial';
import { DAY_IN_MILLISECONDS, TRIAL_LENGTH_IN_MILLISECONDS } from 'constant';

const minuteInMilliseconds = 60000;
const hourInMilliseconds = 3600000;

describe('getTimeRemainingInTrial', () => {
  const time = new Date().getTime();
  test('no trial started timestamp', () => {
    expect(
      getTimeRemainingInTrial(time, null, TRIAL_LENGTH_IN_MILLISECONDS)
    ).toEqual('No time');
  });

  test('14 days and 13 hours remaining', () => {
    expect(
      getTimeRemainingInTrial(
        time,
        time,
        14 * DAY_IN_MILLISECONDS + 13 * hourInMilliseconds
      )
    ).toEqual('15 days');
  });

  test('14 days and 11 hours remaining', () => {
    expect(
      getTimeRemainingInTrial(
        time,
        time,
        14 * DAY_IN_MILLISECONDS + 11 * hourInMilliseconds
      )
    ).toEqual('14 days, 11 hours');
  });

  test('14 days remaining', () => {
    expect(
      getTimeRemainingInTrial(time, time, 14 * DAY_IN_MILLISECONDS)
    ).toEqual('14 days');
  });

  test('2 hours remaining', () => {
    expect(
      getTimeRemainingInTrial(time, time, DAY_IN_MILLISECONDS * 2)
    ).toEqual('2 days');
  });

  test('1 day, 14 hours remaining', () => {
    expect(
      getTimeRemainingInTrial(
        time,
        time - 10 * hourInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      )
    ).toEqual('2 days');
  });

  test('exactly 1 day remaining', () => {
    expect(
      getTimeRemainingInTrial(
        time,
        time - 24 * hourInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      )
    ).toEqual('1 day');
  });

  test('five hours remaining', () => {
    expect(
      getTimeRemainingInTrial(
        time,
        time - 43 * hourInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      )
    ).toEqual('5 hours');
  });

  test('one hour remaining', () => {
    expect(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      )
    ).toEqual('1 hour');
  });

  test('23 minutes remaining', () => {
    expect(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds - 37 * minuteInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      )
    ).toEqual('23 minutes');
  });

  test('1 minute remaining', () => {
    expect(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds - 59 * minuteInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      )
    ).toEqual('1 minute');
  });

  test('30 seconds remaining', () => {
    expect(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds - 59 * minuteInMilliseconds - 30000,
        DAY_IN_MILLISECONDS * 2
      )
    ).toEqual('No time');
  });

  test('no time remaining', () => {
    expect(
      getTimeRemainingInTrial(
        time,
        time - 48 * hourInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      )
    ).toEqual('No time');
  });
});
