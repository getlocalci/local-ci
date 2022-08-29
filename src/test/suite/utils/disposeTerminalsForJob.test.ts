import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import disposeTerminalsForJob from 'terminal/disposeTerminalsForJob';

mocha.afterEach(() => {
  sinon.restore();
});

suite('disposeTerminalsForJob', () => {
  test('terminal is not disposed', async () => {
    const jobName = 'build';

    sinon.stub(vscode, 'window').value({
      terminals: [
        {
          name: jobName,
          dispose: sinon.mock().never(),
        },
      ],
    });

    disposeTerminalsForJob(jobName);
  });

  test('terminal is disposed', async () => {
    const jobName = 'build';

    sinon.stub(vscode, 'window').value({
      terminals: [
        {
          name: jobName,
          dispose: sinon.mock().once(),
        },
      ],
    });

    disposeTerminalsForJob(jobName);
  });
});
