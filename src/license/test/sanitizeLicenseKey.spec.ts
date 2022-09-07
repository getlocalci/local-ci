import sanitizeLicenseKey from 'license/sanitizeLicenseKey';

describe('sanitizeLicenseKey', () => {
  test('empty', async () => {
    expect(sanitizeLicenseKey('')).toEqual('');
  });

  test('only letters and numbers', () => {
    expect(sanitizeLicenseKey('1b2e78c9b0ea4ee888fed8a66d553dfc')).toEqual(
      '1b2e78c9b0ea4ee888fed8a66d553dfc'
    );
  });

  test('with dashes', () => {
    expect(sanitizeLicenseKey('e9bd961ce2d04c0ab2f5b3212127b01a')).toEqual(
      'e9bd961ce2d04c0ab2f5b3212127b01a'
    );
  });

  test('with tag', () => {
    expect(
      sanitizeLicenseKey('ccae17<script>alert("dothis")</script>632f10407')
    ).toEqual('ccae17scriptalertdothisscript632f10407');
  });

  test('with invalid characters', () => {
    expect(
      sanitizeLicenseKey('66e56321$(*&@!2b0b4~**))5b1af385e10ff9049e8')
    ).toEqual('66e563212b0b45b1af385e10ff9049e8');
  });

  test('with whitespace', () => {
    expect(sanitizeLicenseKey(' f5d5e 32c017b4e9 8a066d8c22e6f1ea1 ')).toEqual(
      'f5d5e32c017b4e98a066d8c22e6f1ea1'
    );
  });
});
