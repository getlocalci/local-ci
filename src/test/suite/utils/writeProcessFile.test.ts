import * as assert from 'assert';
import * as fs from 'fs';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as yaml from 'js-yaml';
import { getTestFilePath, normalize } from '../../helpers';
import writeProcessFile from '../../../utils/writeProcessFile';

mocha.afterEach(() => {
  sinon.restore();
});

suite('writeProcessFile', () => {
  test('No config', () => {
    sinon.mock(fs).expects('writeFileSync').once().withArgs({});
    writeProcessFile('', '/foo/baz');
  });

  test('Full config file with cache', () => {
    const fileName = 'with-cache.yml';
    sinon.mock(fs).expects('mkdirSync').once();

    const writeFileSyncSpy = sinon.spy();
    sinon.stub(fs, 'writeFileSync').value(writeFileSyncSpy);

    writeProcessFile(
      fs.readFileSync(getTestFilePath('fixture', fileName), 'utf8').toString(),
      '/foo/baz/'
    );

    const actual = writeFileSyncSpy.firstCall.lastArg;
    const expected = fs
      .readFileSync(getTestFilePath('expected', fileName))
      .toString();

    // Ensure there's no .yml error.
    yaml.load(actual);

    assert.strictEqual(normalize(actual), normalize(expected));
  });

  test('Dynamic config', () => {
    const fileName = 'dynamic-config.yml';
    sinon.mock(fs).expects('mkdirSync').once();

    const writeFileSyncSpy = sinon.spy();
    sinon.stub(fs, 'writeFileSync').value(writeFileSyncSpy);

    writeProcessFile(
      fs.readFileSync(getTestFilePath('fixture', fileName), 'utf8').toString(),
      '/foo/baz/'
    );

    const actual = writeFileSyncSpy.firstCall.lastArg;
    const expected = fs
      .readFileSync(getTestFilePath('expected', fileName))
      .toString();

    // Ensure there's no .yml error.
    yaml.load(actual);

    assert.strictEqual(normalize(actual), normalize(expected));
  });
});
