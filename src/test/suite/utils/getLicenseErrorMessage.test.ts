import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getLicenseErrorMessage from '../../../utils/license/getLicenseErrorMessage';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getLicenseErrorMessage', () => {
  test('errors', () => {
    assert.equal(getLicenseErrorMessage(undefined), 'Unknown error');
    assert.equal(getLicenseErrorMessage('missing'), 'License does not exist.');
    assert.equal(getLicenseErrorMessage('missing_url'), 'URL not provided.');
    assert.equal(getLicenseErrorMessage('disabled'), 'License key revoked.');
    assert.equal(
      getLicenseErrorMessage('non_existent_code'),
      'non_existent_code'
    );
  });
});
