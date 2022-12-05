import areTerminalsClosed from 'terminal/areTerminalsClosed';

const baseTerminal = {
  name: 'Example',
  processId: { then: jest.fn() },
  creationOptions: {},
  exitStatus: undefined,
  sendText: jest.fn(),
  show: jest.fn(),
  hide: jest.fn(),
  dispose: jest.fn(),
  state: { isInteractedWith: false },
};

describe('areTerminalsClosed', () => {
  test('only one is closed', () => {
    expect(
      areTerminalsClosed(
        { ...baseTerminal, exitStatus: { code: 1, reason: 1 } },
        baseTerminal
      )
    ).toEqual(false);
  });

  test('all are closed', () => {
    expect(
      areTerminalsClosed(
        { ...baseTerminal, exitStatus: { code: 0, reason: 1 } },
        { ...baseTerminal, exitStatus: { code: 1, reason: 1 } }
      )
    ).toEqual(true);
  });

  test('one undefined, one closed', () => {
    expect(
      areTerminalsClosed(
        { ...baseTerminal, exitStatus: { code: 0, reason: 1 } },
        undefined
      )
    ).toEqual(true);
  });
});
