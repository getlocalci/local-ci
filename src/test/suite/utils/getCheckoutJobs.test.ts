import * as assert from 'assert';
import * as fs from 'fs';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as yaml from 'js-yaml';
import getCheckoutJobs from '../../../utils/getCheckoutJobs';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getCheckoutJobs', () => {
  test('No config file', () => {
    sinon.mock(fs).expects('existsSync').once().returns(false);
    sinon.mock(fs).expects('readFileSync').never();
    assert.deepStrictEqual(getCheckoutJobs('foo'), []);
  });

  test('No checkout job', () => {
    sinon.mock(fs).expects('existsSync').once().returns(true);
    sinon.mock(fs).expects('readFileSync').once().returns('');

    sinon
      .mock(yaml)
      .expects('load')
      .once()
      .returns({
        jobs: { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
      });

    assert.deepStrictEqual(getCheckoutJobs('foo'), []);
  });

  test('With string checkout job', () => {
    sinon.mock(fs).expects('existsSync').once().returns(true);
    sinon.mock(fs).expects('readFileSync').once().returns('');
    sinon
      .mock(yaml)
      .expects('load')
      .once()
      .returns({
        jobs: {
          test: {
            docker: [{ image: 'cimg/node:16.8.0-browsers' }],
            steps: ['node/install-npm', 'checkout'],
          },
        },
      });

    assert.deepStrictEqual(getCheckoutJobs('foo'), ['test']);
  });
});
