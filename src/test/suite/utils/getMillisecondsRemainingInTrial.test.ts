import * as assert from 'assert';
import { TRIAL_LENGTH_IN_MILLISECONDS } from '../../../constants';
import getMillisecondsRemainingInTrial from '../../../utils/getMillisecondsRemainingInTrial';

const hourInMilliseconds = 3600000;
const dayInMilliseconds = 86400000;

suite('getMillisecondsRemainingInTrial', () => {
  test('entire trial remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getMillisecondsRemainingInTrial(time, time, TRIAL_LENGTH_IN_MILLISECONDS),
      TRIAL_LENGTH_IN_MILLISECONDS
    );
  });

  test('1 day remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getMillisecondsRemainingInTrial(
        time,
        time - 24 * hourInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      14 * dayInMilliseconds
    );
  });

  test('1 hour remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getMillisecondsRemainingInTrial(
        time,
        time - (14 * dayInMilliseconds + 23 * hourInMilliseconds),
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      hourInMilliseconds
    );
  });

  test('no time remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getMillisecondsRemainingInTrial(
        time,
        time - 15 * dayInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      0
    );
  });
});
