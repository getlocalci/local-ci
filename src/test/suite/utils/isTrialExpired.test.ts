import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import {
  EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS,
  TRIAL_LENGTH_IN_MILLISECONDS,
} from '../../../constants';
import isTrialExpired from '../../../utils/isTrialExpired';

mocha.afterEach(() => {
  sinon.restore();
});

const dayInMilliseconds = 86400000;
const extendedTrial =
  TRIAL_LENGTH_IN_MILLISECONDS + EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS;

suite('isTrialExpired', () => {
  test('preview just began', () => {
    assert.strictEqual(
      isTrialExpired(new Date().getTime(), TRIAL_LENGTH_IN_MILLISECONDS),
      false
    );
  });

  test('preview began 5 days and 1 millisecond ago', () => {
    assert.strictEqual(
      isTrialExpired(
        new Date().getTime() - (5 * dayInMilliseconds + 1),
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      true
    );
  });

  test('preview began a week ago', () => {
    assert.strictEqual(
      isTrialExpired(
        new Date().getTime() - 7 * dayInMilliseconds,
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      true
    );
  });

  test('preview just began and was extended', () => {
    assert.strictEqual(
      isTrialExpired(new Date().getTime(), TRIAL_LENGTH_IN_MILLISECONDS),
      false
    );
  });

  test('preview began 5 days and 10 milliseconds ago and was extended', () => {
    assert.strictEqual(
      isTrialExpired(
        new Date().getTime() - (5 * dayInMilliseconds + 10),
        extendedTrial
      ),
      false
    );
  });

  test('preview began a week ago and was extended', () => {
    assert.strictEqual(
      isTrialExpired(
        new Date().getTime() - 7 * dayInMilliseconds,
        extendedTrial
      ),
      false
    );
  });

  test('preview began 20 days and 1 millisecond ago and was extended', () => {
    assert.strictEqual(
      isTrialExpired(
        new Date().getTime() - 20 * dayInMilliseconds,
        extendedTrial
      ),
      true
    );
  });
});
