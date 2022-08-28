import * as vscode from 'vscode';
import {
  EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS,
  HAS_EXTENDED_TRIAL,
  TRIAL_LENGTH_IN_MILLISECONDS,
} from 'constants/';

export default function getTrialLength(
  context: vscode.ExtensionContext
): number {
  return context.globalState.get(HAS_EXTENDED_TRIAL)
    ? EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS + TRIAL_LENGTH_IN_MILLISECONDS
    : TRIAL_LENGTH_IN_MILLISECONDS;
}
