import * as vscode from 'vscode';
import { ENTER_LICENSE_COMMAND } from '../constants';
import Warning from '../Warning';
import getHoursRemainingInPreview from './getHoursRemainingInPreview';
import isPreviewExpired from './isPreviewExpired';
import { LICENSE_KEY_STATE } from '../constants';

const whenPreviewStarted = 'localCi:license:whenPreviewStarted';

function getTextForNumber(singular: string, plural: string, count: number) {
  return count === 1 ? singular : plural;
}

export default function licensePrompt(
  context: vscode.ExtensionContext
): Warning[] {
  const previewStartedTimeStamp = context.globalState.get(whenPreviewStarted);
  const licenseKey = context.globalState.get(LICENSE_KEY_STATE);

  if (!previewStartedTimeStamp && !licenseKey) {
    context.globalState.update(whenPreviewStarted, new Date().getTime());
    return [
      new Warning('Thanks for previewing Local CI!', 'info'),
      new Warning(
        'This free preview will last for 2 days, then it will require a purchased license key.'
      ),
      new Warning('Enter license', '', ENTER_LICENSE_COMMAND),
    ];
  }

  if (isPreviewExpired(previewStartedTimeStamp) && !licenseKey) {
    return [
      new Warning('Thanks for previewing Local CI!', 'warning'),
      new Warning('Please enter a Local CI license key.'),
      new Warning('Enter license', '', ENTER_LICENSE_COMMAND),
    ];
  }

  if (!isPreviewExpired(previewStartedTimeStamp)) {
    const timeRemaining = getHoursRemainingInPreview(
      new Date().getTime(),
      previewStartedTimeStamp
    );

    return [
      new Warning('Thanks for previewing Local CI!', 'info'),
      new Warning(
        getTextForNumber(
          `Your trial has ${timeRemaining} hour left.`,
          `Your trial has ${timeRemaining} hours left.`,
          timeRemaining
        )
      ),
      new Warning('Enter license', '', ENTER_LICENSE_COMMAND),
    ];
  }

  return [];
}
