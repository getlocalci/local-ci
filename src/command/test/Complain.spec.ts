import EditorGateway from 'gateway/EditorGateway';
import Complain from 'command/Complain';
import container from 'common/TestAppRoot';

let complain: Complain;
let editorGateway: EditorGateway;

describe('Complain command', () => {
  beforeEach(() => {
    complain = container.complain;
    editorGateway = container.editorGateway;
  });

  test('opens the complain email url', () => {
    const editorSpy = jest.fn();
    editorGateway.editor.env.openExternal = editorSpy;
    const stubUri = 'emailto:ryan@getlocalci.com';
    // @ts-expect-error stub is the wrong type.
    editorGateway.editor.Uri.parse = () => stubUri;

    complain.getCallback()();

    expect(editorSpy).toHaveBeenCalledWith(stubUri);
  });
});
