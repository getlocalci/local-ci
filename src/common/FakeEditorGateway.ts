import { injectable } from 'inversify';

/** Stub class for the editor. */
@injectable()
export default class FakeEditorGateway {
  editor = {
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
