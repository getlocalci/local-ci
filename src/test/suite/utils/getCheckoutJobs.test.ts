import * as assert from 'assert';
import * as fs from 'fs';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getCheckoutJobs from '../../../utils/getCheckoutJobs';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getCheckoutJobs', () => {
  test('No config file', () => {
    assert.deepStrictEqual(getCheckoutJobs(undefined), []);
  });

  test('No checkout job', () => {
    sinon.mock(fs).expects('existsSync').once().returns(true);
    sinon.mock(fs).expects('readFileSync').once().returns('');

    assert.deepStrictEqual(
      getCheckoutJobs({
        jobs: { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
        workflows: {},
      }),
      []
    );
  });

  test('With string checkout job', () => {
    assert.deepStrictEqual(
      getCheckoutJobs({
        jobs: {
          test: {
            docker: [{ image: 'cimg/node:16.8.0-browsers' }],
            steps: ['node/install-npm', 'checkout'],
          },
        },
        workflows: {},
      }),
      ['test']
    );
  });
});
