import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import Types from 'common/Types';
import EditorGateway from 'gateway/EditorGateway';
import getHash from './getHash';
import HttpGateway from 'gateway/HttpGateway';
import {
  DAY_IN_MILLISECONDS,
  LICENSE_ERROR,
  LICENSE_ITEM_ID,
  LICENSE_KEY,
  LICENSE_VALIDITY,
  LICENSE_VALIDITY_CACHE_EXPIRATION,
} from 'constant';
const licenseValidationEndpoint = 'https://getlocalci.com';
const fiveMinutesInMilliseconds = 300000;

@injectable()
export default class License {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(Types.IHttpGateway)
  httpGateway!: HttpGateway;

  async isValid(
    context: vscode.ExtensionContext,
    forceRecheck?: boolean,
    licenseKey?: string | unknown
  ): Promise<boolean> {
    if ('' === licenseKey) {
      context.secrets.store(LICENSE_ERROR, 'Empty license key');
      return false;
    }

    const trimmedLicenseKey = licenseKey
      ? String(licenseKey).trim()
      : (await context.secrets.get(LICENSE_KEY))?.trim();

    if (!forceRecheck && !this.isCachedValidityExpired(context)) {
      return !!context.globalState.get(LICENSE_VALIDITY);
    }

    let response;
    try {
      response = await this.httpGateway.get(licenseValidationEndpoint, {
        params: {
          headers: {
            'Cache-Control': 'no-cache',
          },
          license: encodeURI(String(trimmedLicenseKey)),
          edd_action: 'activate_license',
          item_id: LICENSE_ITEM_ID,
          url: getHash(this.editorGateway.editor.env.machineId),
        },
      });
    } catch (e) {
      context.secrets.store(LICENSE_ERROR, (e as ErrorWithMessage)?.message);
    }

    const isValid = !!response?.data?.success;
    context.globalState.update(LICENSE_VALIDITY, isValid);
    context.globalState.update(
      LICENSE_VALIDITY_CACHE_EXPIRATION,
      new Date().getTime() +
        (isValid ? DAY_IN_MILLISECONDS : fiveMinutesInMilliseconds)
    );

    if (!isValid && response?.data?.error) {
      context.secrets.store(LICENSE_ERROR, response.data.error);
    }

    if (isValid) {
      context.secrets.delete(LICENSE_ERROR);
    }

    return isValid;
  }

  isCachedValidityExpired(context: vscode.ExtensionContext): boolean {
    const expiration = context.globalState.get(
      LICENSE_VALIDITY_CACHE_EXPIRATION
    );
    return typeof expiration === 'number' && new Date().getTime() > expiration;
  }
}
