import * as assert from 'assert';
import * as fs from 'fs';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { getTestFilePath, normalize } from '../../helpers';
import writeProcessFile from '../../../utils/process/writeProcessFile';

mocha.afterEach(() => {
  sinon.restore();
});

suite('writeProcessFile', () => {
  test('no config', () => {
    sinon.mock(fs).expects('writeFileSync').once().withArgs({});
    writeProcessFile('', '/foo/baz');
  });

  test('full config file with cache', () => {
    const fileName = 'with-cache.yml';
    sinon.mock(fs).expects('mkdirSync').once();

    const writeFileSyncSpy = sinon.spy();
    sinon.stub(fs, 'writeFileSync').value(writeFileSyncSpy);

    writeProcessFile(
      fs.readFileSync(getTestFilePath('fixture', fileName), 'utf8').toString(),
      '/foo/baz/'
    );

    assert.strictEqual(
      normalize(writeFileSyncSpy.firstCall.lastArg),
      normalize(
        fs.readFileSync(getTestFilePath('expected', fileName)).toString()
      )
    );
  });

  test('dynamic config', () => {
    const fileName = 'dynamic-config.yml';
    sinon.mock(fs).expects('mkdirSync').once();

    const writeFileSyncSpy = sinon.spy();
    sinon.stub(fs, 'writeFileSync').value(writeFileSyncSpy);

    writeProcessFile(
      fs.readFileSync(getTestFilePath('fixture', fileName), 'utf8').toString(),
      '/foo/baz/'
    );

    assert.strictEqual(
      normalize(writeFileSyncSpy.firstCall.lastArg),
      normalize(
        fs.readFileSync(getTestFilePath('expected', fileName)).toString()
      )
    );
  });
});
