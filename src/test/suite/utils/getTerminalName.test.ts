import * as assert from 'assert';
import getTerminalName from 'utils/terminal/getTerminalName';

suite('getTerminalName', () => {
  test('errors', () => {
    assert.strictEqual(getTerminalName('test'), 'Local CI test');
    assert.strictEqual(getTerminalName(''), 'Local CI ');
  });
});
