import * as assert from 'assert';
import * as fs from 'fs';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as yaml from 'js-yaml';
import getJobs from '../../../utils/getJobs';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getJobs', () => {
  test('Single job', () => {
    sinon.mock(fs).expects('readFileSync').once().returns('');
    sinon
      .mock(yaml)
      .expects('load')
      .once()
      .returns({
        jobs: { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
      });

    assert.deepStrictEqual(getJobs('example-path'), ['test']);
  });

  test('Multipls jobs', () => {
    sinon.mock(fs).expects('readFileSync').once().returns('');
    sinon
      .mock(yaml)
      .expects('load')
      .once()
      .returns({
        jobs: {
          lint: { docker: [{ image: 'cimg/node:16.8.0' }] },
          test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] },
          deploy: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] },
        },
      });

    assert.deepStrictEqual(getJobs('example-path'), ['lint', 'test', 'deploy']);
  });
});
