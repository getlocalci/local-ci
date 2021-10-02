/* eslint-disable @typescript-eslint/no-empty-function */
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import {
  CACHED_LICENSE_VALIDITY,
  LICENSE_VALIDITY_CACHED_TIME,
} from '../../../constants';
import { Substitute } from '@fluffy-spoon/substitute';
import getLicenseInformation from '../../../utils/getLicenseInformation';

mocha.afterEach(() => {
  sinon.restore();
});

function getMockContext(licenseKey: string) {
  const initialContext = Substitute.for<vscode.ExtensionContext>();

  return {
    ...initialContext,
    globalState: {
      ...initialContext.globalState,
      get: (stateKey: string) => {
        if (stateKey === CACHED_LICENSE_VALIDITY) {
          return true;
        }
        if (stateKey === LICENSE_VALIDITY_CACHED_TIME) {
          return new Date().getTime();
        }
      },
      keys: () => ['foo'],
      update: async () => {},
      setKeysForSync: sinon.mock(),
    },
    secrets: {
      ...initialContext.secrets,
      delete: async () => {},
      get: async () => licenseKey,
    },
  };
}

suite('getLicenseInformation', () => {
  test('no license', async () => {
    assert.ok(
      (await getLicenseInformation(getMockContext(''))).includes(
        'Enter license key'
      )
    );
  });
  test('valid license', async () => {
    const actual = await getLicenseInformation(getMockContext('123456789'));
    assert.strictEqual(actual.includes('Enter license key'), false);
    assert.ok(actual.includes('Your Local CI license key is valid'));
  });
});
