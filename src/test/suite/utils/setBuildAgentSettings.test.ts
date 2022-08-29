import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as os from 'os';
import * as sinon from 'sinon';
import setBuildAgentSettings from 'config/setBuildAgentSettings';

mocha.afterEach(() => {
  sinon.restore();
});

suite('setBuildAgentSettings', () => {
  test('should not set the settings on a Linux machine', () => {
    const spawnSpy = sinon.spy();
    sinon.stub(os, 'type').value(() => 'Intel');
    sinon.stub(os, 'arch').value(() => 'x64');
    sinon.stub(cp, 'spawn').value(spawnSpy);

    setBuildAgentSettings();
    assert.equal(spawnSpy.called, false);
  });

  test('should not set the settings on an M1 Mac machine', () => {
    const spawnSpy = sinon.spy();
    sinon.stub(os, 'type').value(() => 'Darwin');
    sinon.stub(os, 'arch').value(() => 'arm64');
    sinon.stub(cp, 'spawn').value(spawnSpy);

    setBuildAgentSettings();
    assert.equal(spawnSpy.called, false);
  });

  test('should set the settings on an Intel Mac machine', () => {
    const spawnSpy = sinon.spy();
    sinon.stub(os, 'type').value(() => 'Darwin');
    sinon.stub(os, 'arch').value(() => 'x64');
    sinon.stub(cp, 'spawn').value(spawnSpy);

    setBuildAgentSettings();
    assert.equal(spawnSpy.called, true);
  });
});
