import getContextStub from 'test-tool/helper/getContextStub';
import getContainer from 'test-tool/TestRoot';

describe('DebugRepo command', () => {
  test('selects the repo if there is a path', () => {
    const { jobProviderFactory, debugRepo } = getContainer();

    const updateSpy = jest.fn().mockImplementationOnce(async () => null);
    const contextStub = {
      ...getContextStub(),
      globalState: {
        ...getContextStub().globalState,
        update: updateSpy,
        get: async () => null,
      },
    };

    const jobProvider = jobProviderFactory.create(contextStub);
    const uriStub = {
      fsPath: 'foo/example',
      scheme: '',
      authority: '',
      path: '',
      query: '',
      fragment: '',
      with: () => uriStub,
      toJSON: () => '',
    };
    jobProvider.hardRefresh = jest.fn();

    debugRepo.getCallback(contextStub, jobProvider)(uriStub);
    expect(updateSpy).toHaveBeenCalled();
    expect(jobProvider.hardRefresh).toHaveBeenCalled;
  });
});
