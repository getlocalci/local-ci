import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getCheckoutJobs from '../../../utils/getCheckoutJobs';
import getConfigFile from '../../../utils/getConfigFile';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getCheckoutJobs', () => {
  test('empty config file', () => {
    sinon.spy(getConfigFile).returned({
      jobs: { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
    });
    assert.strictEqual(getCheckoutJobs('foo'), []);
  });
});
