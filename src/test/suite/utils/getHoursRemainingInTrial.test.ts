import * as assert from 'assert';
import getHoursRemainingInTrial from '../../../utils/getHoursRemainingInTrial';

const hourInMilliseconds = 3600000;
suite('getHoursRemainingInTrial', () => {
  test('entire trial remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(getHoursRemainingInTrial(time, time), 48);
  });

  test('one day remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getHoursRemainingInTrial(time, time - 24 * hourInMilliseconds),
      24
    );
  });

  test('one hour remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getHoursRemainingInTrial(time, time - 47 * hourInMilliseconds),
      1
    );
  });

  test('no time remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getHoursRemainingInTrial(time, time - 48 * hourInMilliseconds),
      0
    );
  });
});
