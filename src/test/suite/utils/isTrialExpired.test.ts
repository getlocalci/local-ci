import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import {
  DAY_IN_MILLISECONDS,
  TRIAL_LENGTH_IN_MILLISECONDS,
} from '../../../constants';
import isTrialExpired from '../../../utils/isTrialExpired';

mocha.afterEach(() => {
  sinon.restore();
});

suite('isTrialExpired', () => {
  test('preview just began', () => {
    assert.strictEqual(
      isTrialExpired(new Date().getTime(), TRIAL_LENGTH_IN_MILLISECONDS),
      false
    );
  });

  test('preview barely expired', () => {
    assert.strictEqual(
      isTrialExpired(
        new Date().getTime() - (15 * DAY_IN_MILLISECONDS + 1),
        TRIAL_LENGTH_IN_MILLISECONDS
      ),
      true
    );
  });

  test('trial expired by 2 days', () => {
    assert.strictEqual(
      isTrialExpired(
        new Date().getTime() - 17 * DAY_IN_MILLISECONDS,
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
});
