import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import disposeTerminalsForJob from '../../../utils/disposeTerminalsForJob';

mocha.afterEach(() => {
  sinon.restore();
});

suite('disposeTerminalsForJob', () => {
  test('Terminal is not disposed', async () => {
    const jobName = 'build';
    const processId = 98765;
    const runningTerminals = {
      [jobName]: [12345],
    };

    sinon.stub(vscode, 'window').value({
      terminals: [
        {
          processId: Promise.resolve(() => processId),
          dispose: sinon.mock().never(),
        },
      ],
    });

    await disposeTerminalsForJob(runningTerminals, jobName);
  });

  test('Terminal is disposed', async () => {
    const jobName = 'build';
    const processId = 98765;
    const runningTerminals = {
      [jobName]: [processId],
    };

    sinon.stub(vscode, 'window').value({
      terminals: [
        {
          processId: Promise.resolve(() => processId),
          dispose: sinon.mock().once(),
        },
      ],
    });

    await disposeTerminalsForJob(runningTerminals, jobName);
  });
});
