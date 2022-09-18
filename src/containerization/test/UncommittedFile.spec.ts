import AppTestHarness from 'test-tools/helper/AppTestHarness';
import FakeChildProcessGateway from 'gateway/FakeChildProcessGateway';
import FakeEditorGateway from 'gateway/FakeEditorGateway';
import getContextStub from 'test-tools/helper/getContextStub';
import UncommittedFile from 'containerization/UncommittedFile';

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

let childProcessGateway: FakeChildProcessGateway;
let editorGateway: FakeEditorGateway;
let uncommittedFile: UncommittedFile;
let testHarness: AppTestHarness;

describe('uncommittedWarning', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    uncommittedFile = testHarness.container.get(UncommittedFile);
    childProcessGateway = testHarness.childProcessGateway;
    editorGateway = testHarness.editorGateway;
  });

  test('warning is suppressed', async () => {
    const showWarningMessageSpy = jest.fn();
    (editorGateway.editor.window.showWarningMessage = showWarningMessageSpy),
      uncommittedFile.warn(getMockContext(true), '/foo/baz', 'build', []);
    expect(showWarningMessageSpy).not.toHaveBeenCalled();
  });

  test('no uncommitted file', async () => {
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
          on: (event: unknown, callback: CallableFunction) => callback(data),
        },
      };
    });

    uncommittedFile.warn(getMockContext(false), '/foo/baz', 'test-lint', []);
    expect(showWarningMessageSpy).not.toHaveBeenCalled();
  });

  test('only an uncommitted config file should not show a warning', async () => {
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
          on: (event: unknown, callback: CallableFunction) => callback(data),
        },
      };
    });

    uncommittedFile.warn(getMockContext(false), '/foo/baz', 'test-lint', []);
    expect(showWarningMessageSpy).not.toHaveBeenCalled();
  });

  test('with uncommitted files', async () => {
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
          on: (event: unknown, callback: CallableFunction) => callback(data),
        },
      };
    });

    uncommittedFile.warn(getMockContext(false), '/foo/baz', 'build', []);
    expect(showWarningMessageSpy).toHaveBeenCalledTimes(1);
  });

  test('not a checkout job', async () => {
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
          on: (event: unknown, callback: CallableFunction) => callback(data),
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
