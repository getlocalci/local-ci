import * as assert from 'assert';
import getHoursRemainingInPreview from '../../../utils/getHoursRemainingInPreview';

const hourInMilliseconds = 3600000;
suite('getHoursRemainingInPreview', () => {
  test('entire trial remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(getHoursRemainingInPreview(time, time), 48);
  });

  test('one day remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getHoursRemainingInPreview(time, time - 24 * hourInMilliseconds),
      24
    );
  });

  test('one hour remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getHoursRemainingInPreview(time, time - 47 * hourInMilliseconds),
      1
    );
  });

  test('no time remaining', () => {
    const time = new Date().getTime();
    assert.strictEqual(
      getHoursRemainingInPreview(time, time - 48 * hourInMilliseconds),
      0
    );
  });
});
