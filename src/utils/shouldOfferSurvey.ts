import * as vscode from 'vscode';
import {
  DAY_IN_MILLISECONDS,
  HAS_EXTENDED_TRIAL,
  TRIAL_STARTED_TIMESTAMP,
} from '../constants';
import getTrialLength from './getTrialLength';
import isTrialExpired from './isTrialExpired';

export default function shouldOfferSurvey(context: vscode.ExtensionContext) {
  return (
    !context.globalState.get(HAS_EXTENDED_TRIAL) &&
    isTrialExpired(
      context.globalState.get(TRIAL_STARTED_TIMESTAMP),
      getTrialLength(context) + 1 * DAY_IN_MILLISECONDS
    )
  );
}
