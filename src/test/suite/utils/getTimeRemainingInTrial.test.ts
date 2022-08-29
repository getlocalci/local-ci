import * as assert from 'assert';
import { DAY_IN_MILLISECONDS, TRIAL_LENGTH_IN_MILLISECONDS } from 'constants/';
import getTimeRemainingInTrial from 'utils/license/getTimeRemainingInTrial';

const minuteInMilliseconds = 60000;
const hourInMilliseconds = 3600000;

suite('getTimeRemainingInTrial', () => {
  const time = new Date().getTime();
  test('no trial started timestamp', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(time, null, TRIAL_LENGTH_IN_MILLISECONDS),
      'No time'
    );
  });

  test('14 days and 13 hours remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time,
        14 * DAY_IN_MILLISECONDS + 13 * hourInMilliseconds
      ),
      '15 days'
    );
  });

  test('14 days and 11 hours remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time,
        14 * DAY_IN_MILLISECONDS + 11 * hourInMilliseconds
      ),
      '14 days, 11 hours'
    );
  });

  test('14 days remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(time, time, 14 * DAY_IN_MILLISECONDS),
      '14 days'
    );
  });

  test('2 hours remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(time, time, DAY_IN_MILLISECONDS * 2),
      '2 days'
    );
  });

  test('1 day, 14 hours remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 10 * hourInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      ),
      '2 days'
    );
  });

  test('exactly 1 day remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 24 * hourInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      ),
      '1 day'
    );
  });

  test('five hours remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 43 * hourInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      ),
      '5 hours'
    );
  });

  test('one hour remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      ),
      '1 hour'
    );
  });

  test('23 minutes remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds - 37 * minuteInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      ),
      '23 minutes'
    );
  });

  test('1 minute remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds - 59 * minuteInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      ),
      '1 minute'
    );
  });

  test('30 seconds remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds - 59 * minuteInMilliseconds - 30000,
        DAY_IN_MILLISECONDS * 2
      ),
      'No time'
    );
  });

  test('no time remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 48 * hourInMilliseconds,
        DAY_IN_MILLISECONDS * 2
      ),
      'No time'
    );
  });
});
