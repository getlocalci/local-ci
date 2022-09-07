import getFinalTerminalName from 'terminal/getFinalTerminalName';

describe('getFinalTerminalName', () => {
  expect(getFinalTerminalName('composer')).toEqual(
    'Local CI final debugging composer'
  );
  expect(getFinalTerminalName('')).toEqual('Local CI final debugging ');
});
