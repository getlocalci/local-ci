import * as assert from 'assert';
import sanitizeLicenseKey from '../../../utils/license/sanitizeLicenseKey';

suite('sanitizeLicenseKey', () => {
  test('empty', async () => {
    assert.strictEqual(sanitizeLicenseKey(''), '');
  });

  test('only letters and numbers', () => {
    assert.strictEqual(
      sanitizeLicenseKey('1b2e78c9b0ea4ee888fed8a66d553dfc'),
      '1b2e78c9b0ea4ee888fed8a66d553dfc'
    );
  });

  test('with dashes', () => {
    assert.strictEqual(
      sanitizeLicenseKey('e9bd961ce2d04c0ab2f5b3212127b01a'),
      'e9bd961ce2d04c0ab2f5b3212127b01a'
    );
  });

  test('with tag', () => {
    assert.strictEqual(
      sanitizeLicenseKey('ccae17<script>alert("dothis")</script>632f10407'),
      'ccae17scriptalertdothisscript632f10407'
    );
  });

  test('with invalid characters', () => {
    assert.strictEqual(
      sanitizeLicenseKey('66e56321$(*&@!2b0b4~**))5b1af385e10ff9049e8'),
      '66e563212b0b45b1af385e10ff9049e8'
    );
  });

  test('with whitespace', () => {
    assert.strictEqual(
      sanitizeLicenseKey(' f5d5e 32c017b4e9 8a066d8c22e6f1ea1 '),
      'f5d5e32c017b4e98a066d8c22e6f1ea1'
    );
  });
});
