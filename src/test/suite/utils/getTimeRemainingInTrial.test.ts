import * as assert from 'assert';
import { TRIAL_LENGTH_IN_MILLISECONDS } from '../../../constants';
import getTimeRemainingInTrial from '../../../utils/getTimeRemainingInTrial';

const minuteInMilliseconds = 60000;
const hourInMilliseconds = 3600000;

suite('getTimeRemainingInTrial', () => {
  test('no trial started timestamp', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getTimeRemainingInTrial(time, null, TRIAL_LENGTH_IN_MILLISECONDS),
      'No time'
    );
  });

  test('entire trial remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getTimeRemainingInTrial(time, time, TRIAL_LENGTH_IN_MILLISECONDS),
      '2 days'
    );
  });

  test('1 day, 14 hours remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 10 * hourInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      '1 day'
    );
  });

  test('exactly one day remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 24 * hourInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      '1 day'
    );
  });

  test('five hours remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 43 * hourInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      '5 hours'
    );
  });

  test('one hour remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      '1 hour'
    );
  });

  test('one minute remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds - 59 * minuteInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      '1 minute'
    );
  });

  test('no time remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getTimeRemainingInTrial(
        time,
        time - 48 * hourInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      'No time'
    );
  });
});
