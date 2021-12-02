import * as assert from 'assert';
import { TRIAL_LENGTH_IN_MILLISECONDS } from '../../../constants';
import getMillisecondsRemainingInTrial from '../../../utils/getMillisecondsRemainingInTrial';

const hourInMilliseconds = 3600000;
suite('getMillisecondsRemainingInTrial', () => {
  test('entire trial remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getMillisecondsRemainingInTrial(time, time, TRIAL_LENGTH_IN_MILLISECONDS),
      172800000
    );
  });

  test('one day remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getMillisecondsRemainingInTrial(
        time,
        time - 24 * hourInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      86400000
    );
  });

  test('one hour remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getMillisecondsRemainingInTrial(
        time,
        time - 47 * hourInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      3600000
    );
  });

  test('no time remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getMillisecondsRemainingInTrial(
        time,
        time - 48 * hourInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      0
    );
  });
});
