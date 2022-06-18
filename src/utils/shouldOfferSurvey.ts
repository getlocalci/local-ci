import * as vscode from 'vscode';
import { HAS_EXTENDED_TRIAL, TRIAL_STARTED_TIMESTAMP } from '../constants';
import getTrialLength from './getTrialLength';
import isTrialExpired from './isTrialExpired';
const dayInMilliseconds = 86400000;

export default function shouldOfferSurvey(context: vscode.ExtensionContext) {
  return (
    !context.globalState.get(HAS_EXTENDED_TRIAL) &&
    isTrialExpired(
      context.globalState.get(TRIAL_STARTED_TIMESTAMP),
      getTrialLength(context) + 1 * dayInMilliseconds
    )
  );
}
