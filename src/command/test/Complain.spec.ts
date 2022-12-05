import AppTestHarness from 'test-tool/helper/AppTestHarness';
import FakeEditorGateway from 'gateway/FakeEditorGateway';
import Complain from 'command/Complain';

let complain: Complain;
let editorGateway: FakeEditorGateway;

describe('Complain command', () => {
  beforeEach(() => {
    const testHarness = new AppTestHarness();
    testHarness.init();
    complain = testHarness.container.get(Complain);
    editorGateway = testHarness.editorGateway;
  });

  test('opens the complain email url', () => {
    const editorSpy = jest.fn();
    editorGateway.editor.env.openExternal = editorSpy;
    const stubUri = 'emailto:ryan@getlocalci.com';
    editorGateway.editor.Uri.parse = () => stubUri;

    complain.getCallback()();

    expect(editorSpy).toHaveBeenCalledWith(stubUri);
  });
});
