import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import areAllTerminalsClosed from '../../../utils/areAllTerminalsClosed';

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
};

suite('areAllTerminalsClosed', () => {
  test('Only one is closed', () => {
    assert.strictEqual(
      false,
      areAllTerminalsClosed(
        { ...baseTerminal, exitStatus: { code: 1 } },
        baseTerminal
      )
    );
  });

  test('All are closed', () => {
    assert.strictEqual(
      true,
      areAllTerminalsClosed(
        { ...baseTerminal, exitStatus: { code: 0 } },
        { ...baseTerminal, exitStatus: { code: 1 } }
      )
    );
  });
});
