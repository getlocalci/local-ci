import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getLicenseErrorMessage from '../../../utils/getLicenseErrorMessage';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getLicenseErrorMessage', () => {
  test('errors', () => {
    assert(getLicenseErrorMessage('missing'), 'License does not exist');
    assert(getLicenseErrorMessage('missing_url'), 'URL not provided');
    assert(getLicenseErrorMessage('disabled'), 'License key revoked');
    assert(getLicenseErrorMessage('non_existent_code'), 'Unknown error');
  });
});
