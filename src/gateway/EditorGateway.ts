import * as vscode from 'vscode';
import { injectable } from 'inversify';

@injectable()
export default class EditorGateway {
  editor = vscode;
}
