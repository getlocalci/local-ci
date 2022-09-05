import getFinalTerminalName from 'terminal/getFinalTerminalName';

describe('getFinalTerminalName', () => {
  test('errors', () => {
    expect(
      getFinalTerminalName('composer')
    ).toEqual(
      'Local CI final debugging composer'
    );
    expect(getFinalTerminalName('')).toEqual('Local CI final debugging ');
  });
});
