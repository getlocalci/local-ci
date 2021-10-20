import * as assert from 'assert';
import getFinalTerminalName from '../../../utils/getFinalTerminalName';

suite('getFinalTerminalName', () => {
  test('errors', () => {
    assert.strictEqual(
      getFinalTerminalName('composer'),
      'Local CI final debugging composer'
    );
    assert.strictEqual(getFinalTerminalName(''), 'Local CI final debugging ');
  });
});
