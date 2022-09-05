import * as vscode from 'vscode';
import { decorate, injectable } from 'inversify';

class EditorGateway {
  editor = vscode;
}

decorate(injectable(), EditorGateway);
export default EditorGateway;
