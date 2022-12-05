import getTerminalName from '../getTerminalName';

test('getTerminalName', () => {
  expect(getTerminalName('test')).toEqual('Local CI test');
  expect(getTerminalName('')).toEqual('Local CI ');
});
