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
  test('no checkout job', () => {
    sinon.mock(fs).expects('readFileSync').once().returns('');
    sinon
      .mock(yaml)
      .expects('load')
      .once()
      .returns({
        jobs: { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
      });

    assert.notStrictEqual(getCheckoutJobs('foo'), []);
  });

  test('with string checkout job', () => {
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

    assert.notStrictEqual(getCheckoutJobs('foo'), ['test']);
  });
});
