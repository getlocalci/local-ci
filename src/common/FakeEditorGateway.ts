/* eslint-disable @typescript-eslint/no-empty-function */
import { injectable } from 'inversify';

/** Stub class for the editor. */
@injectable()
export default class FakeEditorGateway {
  editor = {
    commands: {
      registerCommand: () => null,
    },
    env: {
      openExternal: () => null,
    },
    EventEmitter: class {},
    ThemeIcon: class {},
    TreeItem: class {
      constructor(public label: string) {}
    },
    TreeItemCollapsibleState: {
      Expanded: 'expanded',
      None: 'none',
    },
    window: {
      createTreeView: () => null,
      registerUriHandler: () => null,
      registerTreeDataProvider: () => null,
      registerWebviewViewProvider: () => null,
      showInformationMessage: async (message: string) => message,
      showWarningMessage: async (message: string) => message,
      showInputBox: async () => '',
      terminals: [{}],
    },
    workspace: {
      asRelativePath: (path: string) => path,
      findFiles: () => Promise.resolve([{ fsPath: 'one/two/' }]),
      getWorkspaceFolder: () => '',
      onDidSaveTextDocument: () => null,
      registerTextDocumentContentProvider: () => null,
      workspaceFolders: [{}],
    },
    Uri: {
      file: (path: string) => path,
      parse: (path: string) => path,
    },
  };
}
