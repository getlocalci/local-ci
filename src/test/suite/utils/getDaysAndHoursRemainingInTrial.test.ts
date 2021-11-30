import * as assert from 'assert';
import getDaysAndHoursRemainingInTrial from '../../../utils/getDaysAndHoursRemainingInTrial';

const hourInMilliseconds = 3600000;
suite('getDaysAndHoursRemainingInTrial', () => {
  test('no trial started timestamp', () => {
    const time = new Date().getTime();
    assert.strictEqual(getDaysAndHoursRemainingInTrial(time, null), 'No time');
  });

  test('entire trial remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(getDaysAndHoursRemainingInTrial(time, time), '2 days');
  });

  test('entire trial remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getDaysAndHoursRemainingInTrial(time, time - 10 * hourInMilliseconds),
      '1 day, 14 hours'
    );
  });

  test('one day remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getDaysAndHoursRemainingInTrial(time, time - 24 * hourInMilliseconds),
      '1 day'
    );
  });

  test('five hours remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getDaysAndHoursRemainingInTrial(time, time - 43 * hourInMilliseconds),
      '5 hours'
    );
  });

  test('one hour remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getDaysAndHoursRemainingInTrial(time, time - 47 * hourInMilliseconds),
      '1 hour'
    );
  });

  test('no time remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getDaysAndHoursRemainingInTrial(time, time - 48 * hourInMilliseconds),
      'No time'
    );
  });
});
