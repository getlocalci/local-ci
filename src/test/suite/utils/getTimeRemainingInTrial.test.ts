import * as assert from 'assert';
import { TRIAL_LENGTH_IN_MILLISECONDS } from '../../../constants';
import getTimeRemainingInTrial from '../../../utils/getTimeRemainingInTrial';

const minuteInMilliseconds = 60000;
const hourInMilliseconds = 3600000;
const dayInMilliseconds = 86400000;

suite('getTimeRemainingInTrial', () => {
  const time = new Date().getTime();
  test('no trial started timestamp', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(time, null, TRIAL_LENGTH_IN_MILLISECONDS),
      'No time'
    );
  });

  test('14 days and 1 hour remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time,
        14 * dayInMilliseconds + hourInMilliseconds
      ),
      '14 days'
    );
  });

  test('14 days remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(time, time, 14 * dayInMilliseconds),
      '14 days'
    );
  });

  test('2 hours remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(time, time, dayInMilliseconds * 2),
      '2 days'
    );
  });

  test('1 day, 14 hours remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 10 * hourInMilliseconds,
        dayInMilliseconds * 2
      ),
      '1 day, 14 hours'
    );
  });

  test('exactly 1 day remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 24 * hourInMilliseconds,
        dayInMilliseconds * 2
      ),
      '1 day'
    );
  });

  test('five hours remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 43 * hourInMilliseconds,
        dayInMilliseconds * 2
      ),
      '5 hours'
    );
  });

  test('one hour remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds,
        dayInMilliseconds * 2
      ),
      '1 hour'
    );
  });

  test('23 minutes remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds - 37 * minuteInMilliseconds,
        dayInMilliseconds * 2
      ),
      '23 minutes'
    );
  });

  test('1 minute remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds - 59 * minuteInMilliseconds,
        dayInMilliseconds * 2
      ),
      '1 minute'
    );
  });

  test('30 seconds remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds - 59 * minuteInMilliseconds - 30000,
        dayInMilliseconds * 2
      ),
      'No time'
    );
  });

  test('no time remaining', () => {
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 48 * hourInMilliseconds,
        dayInMilliseconds * 2
      ),
      'No time'
    );
  });
});
