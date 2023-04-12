import isTrialExpired from 'license/isTrialExpired';
import {
  DAY_IN_MILLISECONDS,
  EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS,
  TRIAL_LENGTH_IN_MILLISECONDS,
} from 'constant';

const extendedTrial =
  TRIAL_LENGTH_IN_MILLISECONDS + EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS;

describe('isTrialExpired', () => {
  test('trial just began', () => {
    expect(
      isTrialExpired(new Date().getTime(), TRIAL_LENGTH_IN_MILLISECONDS)
    ).toEqual(false);
  });

  test('trial barely expired', () => {
    expect(
      isTrialExpired(
        new Date().getTime() - (30 * DAY_IN_MILLISECONDS + 1),
        TRIAL_LENGTH_IN_MILLISECONDS
      )
    ).toEqual(true);
  });

  test('trial expired by 2 days', () => {
    expect(
      isTrialExpired(
        new Date().getTime() - 32 * DAY_IN_MILLISECONDS,
        TRIAL_LENGTH_IN_MILLISECONDS
      )
    ).toEqual(true);
  });

  test('trial just began and was extended', () => {
    expect(
      isTrialExpired(new Date().getTime(), TRIAL_LENGTH_IN_MILLISECONDS)
    ).toEqual(false);
  });

  test('trial began 30 days and 10 milliseconds ago and was extended', () => {
    expect(
      isTrialExpired(
        new Date().getTime() - (30 * DAY_IN_MILLISECONDS + 10),
        extendedTrial
      )
    ).toEqual(false);
  });

  test('trial began 32 days ago and was extended', () => {
    expect(
      isTrialExpired(
        new Date().getTime() - 32 * DAY_IN_MILLISECONDS,
        extendedTrial
      )
    ).toEqual(false);
  });

  test('trial began 45 days and 1 millisecond ago and was extended', () => {
    expect(
      isTrialExpired(
        new Date().getTime() - 45 * DAY_IN_MILLISECONDS,
        extendedTrial
      )
    ).toEqual(true);
  });
});
