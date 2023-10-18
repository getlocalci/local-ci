import getContextStub from 'test-tool/helper/getContextStub';
import getContainer from 'test-tool/TestRoot';

describe('LocalCi', () => {
  test('activate registers commands', () => {
    const { localCi, editorGateway } = getContainer();
    const expectedCommands = [
      'local-ci.email.complain',
      'local-ci.create.config',
      'local-ci.debug.repo',
      'local-ci.license.enter',
      'localCiJobs.enterToken',
      'localCiJobs.exitAllJobs',
      'local-ci.job.exit',
      'local-ci.license.get',
      'localCiJobs.help',
      'localCiJobs.refresh',
      'localCiLicense.refresh',
      'local-ci.job.rerun',
      'local-ci.job.run',
      'local-ci.runWalkthroughJob',
      'localCiJobs.selectRepo',
      'local-ci.show.log-file',
      'local-ci.docker.start',
      'local-ci.process-error.try-again',
    ];

    const spy = jest.fn();
    editorGateway.editor.commands.registerCommand = spy;
    localCi.activate(getContextStub());

    const actualRegisteredCommands = spy.mock.calls.map((call) => {
      return call[0];
    });

    expect(
      expectedCommands.every((command) => {
        if (actualRegisteredCommands.includes(command)) {
          return true;
        }

        throw new Error(`Did not register the command ${command}`);
      })
    ).toBe(true);
  });

  test('deactivate removes the tmp/ file', () => {
    const { localCi, fsGateway } = getContainer();
    fsGateway.fs.rmSync = jest.fn();
    localCi.deactivate();

    expect(fsGateway.fs.rmSync).toHaveBeenCalledTimes(1);
  });
});
