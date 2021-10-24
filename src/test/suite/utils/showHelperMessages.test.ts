import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import showHelperMessages from '../../../utils/showHelperMessages';

mocha.afterEach(() => {
  sinon.restore();
});

suite('showHelperMessages', () => {
  test('No helper message', async () => {
    const showInformationMessageSpy = sinon.spy();
    sinon.stub(vscode, 'window').value({
      showInformationMessage: showInformationMessageSpy,
    });

    const data = { toString: () => 'Here is a message' };
    sinon
      .mock(cp)
      .expects('spawn')
      .once()
      .returns({
        stdout: {
          on: (event: unknown, callback: CallableFunction) => callback(data),
        },
      });

    showHelperMessages('9234323');
    assert.strictEqual(showInformationMessageSpy.called, false);
  });

  test('With helper message', async () => {
    const showInformationMessageSpy = sinon.spy();
    sinon.stub(vscode, 'window').value({
      showInformationMessage: showInformationMessageSpy,
    });

    const data = {
      toString: () =>
        '_XSERVTransmkdir: Owner of /tmp/.X11-unix should be set to root',
    };
    sinon
      .mock(cp)
      .expects('spawn')
      .once()
      .returns({
        stdout: {
          on: (event: unknown, callback: CallableFunction) => callback(data),
        },
      });

    showHelperMessages('9234323');
    assert.ok(showInformationMessageSpy.called);
  });
});
