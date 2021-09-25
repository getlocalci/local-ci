import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import isLicenseValid from '../../../utils/isLicenseValid';

mocha.afterEach(() => {
  sinon.restore();
});

suite('isLicenseValid', () => {
  test('no license key', () => {
    assert.strictEqual(isLicenseValid(''), false);
  });

  test('string license key', () => {
    assert.strictEqual(isLicenseValid('12345'), true);
  });
});
