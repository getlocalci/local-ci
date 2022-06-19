import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import {
  DAY_IN_MILLISECONDS,
  HAS_EXTENDED_TRIAL,
  TRIAL_STARTED_TIMESTAMP,
} from '../../../constants';
import shouldOfferSurvey from '../../../utils/shouldOfferSurvey';

function getMockContext(
  hasExtendedTrial: boolean,
  trialStartedTimestamp: number
) {
  const initialContext = Substitute.for<vscode.ExtensionContext>();

  return {
    ...initialContext,
    globalState: {
      ...initialContext.globalState,
      get: (key: string) => {
        if (key === HAS_EXTENDED_TRIAL) {
          return hasExtendedTrial;
        }
        if (key === TRIAL_STARTED_TIMESTAMP) {
          return trialStartedTimestamp;
        }
      },
    },
  };
}

mocha.afterEach(() => {
  sinon.restore();
});

mocha.afterEach(() => {
  sinon.restore();
});

suite('shouldOfferSurvey', () => {
  test('preview just began', () => {
    assert.strictEqual(
      shouldOfferSurvey(getMockContext(false, new Date().getTime())),
      false
    );
  });

  test('preview expired, and has not been extended', () => {
    assert.strictEqual(
      shouldOfferSurvey(
        getMockContext(false, new Date().getTime() - 50 * DAY_IN_MILLISECONDS)
      ),
      true
    );
  });

  test('preview expired, but already extended it', () => {
    assert.strictEqual(
      shouldOfferSurvey(
        getMockContext(true, new Date().getTime() - 50 * DAY_IN_MILLISECONDS)
      ),
      false
    );
  });
});
