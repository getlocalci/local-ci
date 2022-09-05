import { decorate, injectable } from 'inversify';

/** Stub class for the editor. */
class FakeEditorGateway {
  editor = {
    window: {},
  };
}

decorate(injectable(), FakeEditorGateway);
export default FakeEditorGateway;
