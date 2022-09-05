import { decorate, injectable } from 'inversify';

/** Stub class for the editor. */
class FakeEditorGateway {
  editor = {
    window: {},
    workspace: {
      workspaceFolders: [{}],
    },
  };
}

decorate(injectable(), FakeEditorGateway);
export default FakeEditorGateway;
