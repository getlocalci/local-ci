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

  test('Terminal is disposed', async () => {
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
