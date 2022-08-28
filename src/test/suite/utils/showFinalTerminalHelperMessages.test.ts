import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import showFinalTerminalHelperMessages from '../../../utils/showFinalTerminalHelperMessages';

mocha.afterEach(() => {
  sinon.restore();
});

suite('showFinalTerminalHelperMessages', () => {
  test('no helper message', async () => {
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

    showFinalTerminalHelperMessages('9234323');
    assert.strictEqual(showInformationMessageSpy.called, false);
  });

  test('with helper message', async () => {
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

    showFinalTerminalHelperMessages('9234323');
    assert.ok(showInformationMessageSpy.called);
  });
});
