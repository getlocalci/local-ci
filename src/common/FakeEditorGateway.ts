import { decorate, injectable } from 'inversify';

/** Stub class for the editor. */
class FakeEditorGateway {
  editor = {
    window: {
      showInformationMessage: () => null,
    },
    workspace: {
      workspaceFolders: [{}],
    },
  };
}

decorate(injectable(), FakeEditorGateway);
export default FakeEditorGateway;
