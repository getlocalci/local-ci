import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import areTerminalsClosed from '../../../utils/areTerminalsClosed';

mocha.afterEach(() => {
  sinon.restore();
});

const baseTerminal = {
  name: 'Example',
  processId: { then: sinon.mock() },
  creationOptions: {},
  exitStatus: undefined,
  sendText: sinon.mock(),
  show: sinon.mock(),
  hide: sinon.mock(),
  dispose: sinon.mock(),
  state: { isInteractedWith: false },
};

suite('areTerminalsClosed', () => {
  test('only one is closed', () => {
    assert.strictEqual(
      false,
      areTerminalsClosed(
        { ...baseTerminal, exitStatus: { code: 1 } },
        baseTerminal
      )
    );
  });

  test('all are closed', () => {
    assert.strictEqual(
      true,
      areTerminalsClosed(
        { ...baseTerminal, exitStatus: { code: 0 } },
        { ...baseTerminal, exitStatus: { code: 1 } }
      )
    );
  });

  test('one undefined, one closed', () => {
    assert.strictEqual(
      true,
      areTerminalsClosed(
        { ...baseTerminal, exitStatus: { code: 0 } },
        undefined
      )
    );
  });
});
