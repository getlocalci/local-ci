import * as assert from 'assert';
import * as fs from 'fs';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as yaml from 'js-yaml';
import getConfigFile from '../../../utils/getConfigFile';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getConfigFile', () => {
  test('Normal config file', () => {
    const configFile = {
      jobs: { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
    };

    sinon.mock(fs).expects('readFileSync').once().returns('example');
    sinon.mock(yaml).expects('load').once().returns(configFile);

    assert.strictEqual(getConfigFile('example-path'), configFile);
  });
});
