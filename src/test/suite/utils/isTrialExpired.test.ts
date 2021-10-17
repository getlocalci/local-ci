import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import isTrialExpired from '../../../utils/isTrialExpired';

mocha.afterEach(() => {
  sinon.restore();
});

suite('isTrialExpired', () => {
  test('preview just began', () => {
    assert.strictEqual(isTrialExpired(new Date().getTime()), false);
  });

  test('preview began 2 days and 1 millisecond ago', () => {
    assert.strictEqual(isTrialExpired(new Date().getTime() - 172800001), true);
  });

  test('preview began a week ago', () => {
    assert.strictEqual(isTrialExpired(new Date().getTime() - 604800000), true);
  });
});
