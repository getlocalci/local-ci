import getContainer from 'test-tool/TestRoot';

describe('Complain command', () => {
  test('opens the complain email url', () => {
    const { complain, editorGateway } = getContainer();
    const editorSpy = jest.fn();
    editorGateway.editor.env.openExternal = editorSpy;
    const stubUri = 'emailto:ryan@getlocalci.com';
    // @ts-expect-error stub is the wrong type.
    editorGateway.editor.Uri.parse = () => stubUri;

    complain.getCallback()();

    expect(editorSpy).toHaveBeenCalledWith(stubUri);
  });
});
