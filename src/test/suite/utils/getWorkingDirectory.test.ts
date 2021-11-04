import * as assert from 'assert';
import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getWorkingDirectory from '../../../utils/getWorkingDirectory';

mocha.afterEach(() => {
  sinon.restore();
});

function getMockJob(): Job {
  return { steps: [{ run: 'npm test' }] };
}

function getMockJobWithWorkingDirectory(): Job {
  return {
    ...getMockJob(),
    working_directory: '/root/project', // eslint-disable-line @typescript-eslint/naming-convention
  };
}

suite('getWorkingDirectory', () => {
  test('No image id', async () => {
    assert.strictEqual(
      await getWorkingDirectory('', getMockJob()),
      '/home/circleci/project'
    );
  });

  test('With image id', async () => {
    const data = { toString: () => '/root' };
    sinon
      .mock(cp)
      .expects('spawn')
      .once()
      .returns({
        stdout: {
          on: (event: unknown, callback: CallableFunction) => callback(data),
        },
      });

    assert.strictEqual(
      await getWorkingDirectory('98765', getMockJob()),
      '/root/project'
    );
  });

  test('With working_directory', async () => {
    assert.strictEqual(
      await getWorkingDirectory(
        '/root/project',
        getMockJobWithWorkingDirectory()
      ),
      '/root/project'
    );
  });

  test('Error when getting directory', async () => {
    sinon
      .mock(cp)
      .expects('spawn')
      .once()
      .returns({
        stderr: {
          on: (event: unknown, callback: CallableFunction) =>
            callback({ message: 'There was an error' }),
        },
      });

    assert.strictEqual(
      await getWorkingDirectory('98765', getMockJob()),
      '/home/circleci/project'
    );
  });
});
