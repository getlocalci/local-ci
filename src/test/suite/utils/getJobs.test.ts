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
    sinon.mock(fs).expects('existsSync').once().returns(true);
    sinon.mock(fs).expects('readFileSync').once().returns('');
    sinon
      .mock(yaml)
      .expects('load')
      .once()
      .returns({
        jobs: { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
      });

    assert.strictEqual(getJobs('example-path').length, 1);
  });

  test('Multiple jobs', () => {
    sinon.mock(fs).expects('existsSync').once().returns(true);
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

    assert.strictEqual(getJobs('example-path').length, 3);
  });
});
