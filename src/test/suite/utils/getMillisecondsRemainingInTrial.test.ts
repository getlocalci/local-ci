import * as assert from 'assert';
import getMillisecondsRemainingInTrial from '../../../utils/getMillisecondsRemainingInTrial';

const hourInMilliseconds = 3600000;
suite('getMillisecondsRemainingInTrial', () => {
  test('entire trial remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(getMillisecondsRemainingInTrial(time, time), 172800000);
  });

  test('one day remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getMillisecondsRemainingInTrial(time, time - 24 * hourInMilliseconds),
      86400000
    );
  });

  test('one hour remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getMillisecondsRemainingInTrial(time, time - 47 * hourInMilliseconds),
      3600000
    );
  });

  test('no time remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getMillisecondsRemainingInTrial(time, time - 48 * hourInMilliseconds),
      0
    );
  });
});
