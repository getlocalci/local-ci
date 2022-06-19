import * as vscode from 'vscode';
import {
  EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS,
  HAS_EXTENDED_TRIAL,
  SURVEY_URL,
  TRIAL_LENGTH_IN_MILLISECONDS,
  TRIAL_STARTED_TIMESTAMP,
} from '../constants';
import getPrettyPrintedTimeRemaining from './getPrettyPrintedTimeRemaining';

export default async function onClickTakeSurvey(
  context: vscode.ExtensionContext,
  successCallback: () => void
) {
  if (context.globalState.get(HAS_EXTENDED_TRIAL)) {
    return;
  }

  vscode.env.openExternal(vscode.Uri.parse(SURVEY_URL));

  await context.globalState.update(HAS_EXTENDED_TRIAL, true);
  await context.globalState.update(
    TRIAL_STARTED_TIMESTAMP,
    new Date().getTime()
  );
  successCallback();

  vscode.window.showInformationMessage(
    `Thanks, your free preview is now ${getPrettyPrintedTimeRemaining(
      TRIAL_LENGTH_IN_MILLISECONDS + EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS
    )} longer`
  );
}
