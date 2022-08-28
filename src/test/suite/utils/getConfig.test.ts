import * as assert from 'assert';
import * as fs from 'fs';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as yaml from 'js-yaml';
import getConfig from '../../../utils/config/getConfig';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getConfig', () => {
  test('no config', () => {
    sinon.mock(fs).expects('existsSync').once().returns(false);
    sinon.mock(fs).expects('readFileSync').never();
    assert.strictEqual(getConfig(''), undefined);
  });

  test('with config', () => {
    const configFile = {
      jobs: { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
    };
    sinon.mock(fs).expects('existsSync').once().returns(true);
    sinon.mock(fs).expects('readFileSync').once().returns('example');
    sinon.mock(yaml).expects('load').once().returns(configFile);

    assert.strictEqual(getConfig('example-path'), configFile);
  });
});
