import type vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';

export default function getContextStub() {
  return Substitute.for<vscode.ExtensionContext>();
}
