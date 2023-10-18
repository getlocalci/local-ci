import getContainer from 'test-tool/TestRoot';
import getContextStub from 'test-tool/helper/getContextStub';

function getMockContext(isSuppressed: boolean) {
  const initialContext = getContextStub();
  return {
    ...initialContext,
    globalState: {
      ...initialContext.globalState,
      get: () => {
        return isSuppressed;
      },
    },
  };
}

describe('uncommittedWarning', () => {
  test('warning is suppressed', async () => {
    const { editorGateway, uncommittedFile } = getContainer();
    const showWarningMessageSpy = jest.fn();
    editorGateway.editor.window.showWarningMessage = showWarningMessageSpy;
    uncommittedFile.warn(getMockContext(true), '/foo/baz', 'build', []);

    expect(showWarningMessageSpy).not.toHaveBeenCalled();
  });

  test('no uncommitted file', async () => {
    const { childProcessGateway, editorGateway, uncommittedFile } =
      getContainer();
    const showWarningMessageSpy = jest.fn();
    editorGateway.editor.window.showWarningMessage = (message: string) => {
      return new Promise(() => {
        showWarningMessageSpy(message);
      });
    };

    const data = `  \n`;
    childProcessGateway.cp.spawn = jest.fn().mockImplementationOnce(() => {
      return {
        stdout: {
          on: (_event: unknown, callback: CallableFunction) => callback(data),
        },
      };
    });

    uncommittedFile.warn(getMockContext(false), '/foo/baz', 'test-lint', []);
    expect(showWarningMessageSpy).not.toHaveBeenCalled();
  });

  test('only an uncommitted config file should not show a warning', async () => {
    const { childProcessGateway, editorGateway, uncommittedFile } =
      getContainer();
    const showWarningMessageSpy = jest.fn();
    editorGateway.editor.window.showWarningMessage = (message: string) => {
      return new Promise(() => {
        showWarningMessageSpy(message);
      });
    };

    const data = `M .circleci/config.yml \n`;
    childProcessGateway.cp.spawn = jest.fn().mockImplementationOnce(() => {
      return {
        stdout: {
          on: (_event: unknown, callback: CallableFunction) => callback(data),
        },
      };
    });

    uncommittedFile.warn(getMockContext(false), '/foo/baz', 'test-lint', []);
    expect(showWarningMessageSpy).not.toHaveBeenCalled();
  });

  test('with uncommitted files', async () => {
    const { childProcessGateway, editorGateway, uncommittedFile } =
      getContainer();
    const showWarningMessageSpy = jest.fn();
    editorGateway.editor.window.showWarningMessage = (message: string) => {
      return new Promise(() => {
        showWarningMessageSpy(message);
      });
    };

    const data = `M .circleci/config.yml \nM composer.json \nM package.json`;
    childProcessGateway.cp.spawn = jest.fn().mockImplementationOnce(() => {
      return {
        stdout: {
          on: (_event: unknown, callback: CallableFunction) => callback(data),
        },
      };
    });

    uncommittedFile.warn(getMockContext(false), '/foo/baz', 'build', []);
    expect(showWarningMessageSpy).toHaveBeenCalledTimes(1);
  });

  test('not a checkout job', async () => {
    const { childProcessGateway, editorGateway, uncommittedFile } =
      getContainer();
    const showWarningMessageSpy = jest.fn();
    editorGateway.editor.window.showWarningMessage = (message: string) => {
      return new Promise(() => {
        showWarningMessageSpy(message);
      });
    };

    const data = `M .vscode/tasks.json \nM package.json \n`;
    childProcessGateway.cp.spawn = jest.fn().mockImplementationOnce(() => {
      return {
        stdout: {
          on: (_event: unknown, callback: CallableFunction) => callback(data),
        },
      };
    });

    uncommittedFile.warn(getMockContext(false), '/foo/baz', 'test', [
      'extension-checkout',
    ]);
    expect(showWarningMessageSpy.mock.lastCall[0]).toMatch(
      'Then, please rerun a checkout job, like extension-checkout.'
    );
  });
});
