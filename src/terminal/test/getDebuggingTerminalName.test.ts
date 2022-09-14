import getDebuggingTerminalName from '../getDebuggingTerminalName';

test('getDebuggingTerminalName', () => {
  expect(getDebuggingTerminalName('build')).toEqual('Local CI debugging build');
  expect(getDebuggingTerminalName('')).toEqual('Local CI debugging ');
});
