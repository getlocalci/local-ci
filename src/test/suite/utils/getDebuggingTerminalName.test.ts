import * as assert from 'assert';
import getDebuggingTerminalName from '../../../utils/getDebuggingTerminalName';

suite('getDebuggingTerminalName', () => {
  test('errors', () => {
    assert.strictEqual(
      getDebuggingTerminalName('build'),
      'Local CI debugging build'
    );
    assert.strictEqual(getDebuggingTerminalName(''), 'Local CI debugging ');
  });
});
