import { decorate, injectable } from 'inversify';

/** Stub class for the editor. */
class FakeEditorGateway {
  editor = {
    EventEmitter: class {},
    ThemeIcon: class {},
    TreeItem: class {
      constructor(public label: string) {}
    },
    TreeItemCollapsibleState: {
      None: 'none',
    },
    window: {
      showInformationMessage: () => null,
    },
    workspace: {
      asRelativePath: () => null,
      findFiles: () => null,
      workspaceFolders: [{}],
    },
    Uri: {
      file: (path: string) => path,
    },
  };
}

decorate(injectable(), FakeEditorGateway);
export default FakeEditorGateway;
