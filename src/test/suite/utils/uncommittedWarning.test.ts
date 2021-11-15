import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import uncommittedWarning from '../../../utils/uncommittedWarning';

mocha.afterEach(() => {
  sinon.restore();
});

function getMockContext(isSuppressed: boolean) {
  const initialContext = Substitute.for<vscode.ExtensionContext>();
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

suite('uncommittedWarning', () => {
  test('Warning is suppressed', async () => {
    const showWarningMessageSpy = Promise.resolve(sinon.spy());
    sinon.stub(vscode, 'window').value({
      showWarningMessage: showWarningMessageSpy,
    });

    uncommittedWarning(getMockContext(true), '/foo/baz', 'build', []);
    assert.strictEqual((await showWarningMessageSpy).called, false);
  });

  test('No uncommitted file', async () => {
    const showWarningMessageSpy = sinon.spy();
    sinon.stub(vscode, 'window').value({
      showWarningMessage: async (message: string) =>
        showWarningMessageSpy(message),
    });

    const data = `  \n`;
    sinon
      .mock(cp)
      .expects('spawn')
      .once()
      .returns({
        stdout: {
          on: (event: unknown, callback: CallableFunction) => callback(data),
        },
      });

    uncommittedWarning(getMockContext(false), '/foo/baz', 'test-lint', []);
    assert.strictEqual(showWarningMessageSpy.called, false);
  });

  test('Only an uncommitted config file should not show a warning', async () => {
    const showWarningMessageSpy = sinon.spy();
    sinon.stub(vscode, 'window').value({
      showWarningMessage: async (message: string) =>
        showWarningMessageSpy(message),
    });

    const data = `M .circleci/config.yml \n`;
    sinon
      .mock(cp)
      .expects('spawn')
      .once()
      .returns({
        stdout: {
          on: (event: unknown, callback: CallableFunction) => callback(data),
        },
      });

    uncommittedWarning(getMockContext(false), '/foo/baz', 'test-lint', []);
    assert.strictEqual(showWarningMessageSpy.called, false);
  });

  test('With uncommitted files', async () => {
    const showWarningMessageSpy = sinon.spy();
    sinon.stub(vscode, 'window').value({
      showWarningMessage: async (message: string) =>
        showWarningMessageSpy(message),
    });

    const data = `M .circleci/config.yml \nM composer.json \nM package.json`;
    sinon
      .mock(cp)
      .expects('spawn')
      .once()
      .returns({
        stdout: {
          on: (event: unknown, callback: CallableFunction) => callback(data),
        },
      });

    uncommittedWarning(getMockContext(false), '/foo/baz', 'build', []);
    assert.ok(showWarningMessageSpy.called);
  });

  test('Not a checkout job', async () => {
    const showWarningMessageSpy = sinon.spy();
    sinon.stub(vscode, 'window').value({
      showWarningMessage: async (message: string) =>
        showWarningMessageSpy(message),
    });

    const data = `M .vscode/tasks.json \nM package.json \n`;
    sinon
      .mock(cp)
      .expects('spawn')
      .once()
      .returns({
        stdout: {
          on: (event: unknown, callback: CallableFunction) => callback(data),
        },
      });

    uncommittedWarning(getMockContext(false), '/foo/baz', 'test', [
      'extension-checkout',
    ]);
    assert.ok(
      showWarningMessageSpy.calledWithMatch(
        'Then, please rerun a checkout job, like extension-checkout.'
      )
    );
  });
});
