/* eslint-disable @typescript-eslint/no-empty-function */
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import { HAS_EXTENDED_TRIAL } from '../../../constants';
import onClickTakeSurvey from '../../../utils/onClickTakeSurvey';

let openExternalSpy: sinon.SinonSpy;

mocha.beforeEach(() => {
  openExternalSpy = sinon.spy();

  sinon.stub(vscode, 'env').value({
    openExternal: openExternalSpy,
  });
});

mocha.afterEach(() => {
  sinon.restore();
});

function getMockContext(hasExtendedTrial: boolean) {
  const initialContext = Substitute.for<vscode.ExtensionContext>();

  return {
    ...initialContext,
    globalState: {
      ...initialContext.globalState,
      get: (stateKey: string) => {
        if (stateKey === HAS_EXTENDED_TRIAL) {
          return hasExtendedTrial;
        }
      },
      update: async () => {},
    },
  };
}

suite('onClickTakeSurvey', () => {
  test('has taken survey', async () => {
    const successCallbackSpy = sinon.spy();
    await onClickTakeSurvey(getMockContext(true), successCallbackSpy);

    assert.strictEqual(successCallbackSpy.called, false);
    assert.strictEqual(openExternalSpy.called, false);
  });

  test('has not taken survey', async () => {
    const successCallbackSpy = sinon.spy();
    await onClickTakeSurvey(getMockContext(false), successCallbackSpy);

    assert.strictEqual(successCallbackSpy.called, true);
    assert.strictEqual(openExternalSpy.called, true);
  });
});
