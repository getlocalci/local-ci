import getContainer from 'test-tool/TestRoot';

describe('Job', () => {
  test('no element passed', () => {
    const { jobFactory } = getContainer();
    const jobName = 'this-is-your-job';
    expect(jobFactory.create(jobName, false, false).getJobName()).toEqual(
      jobName
    );
  });

  test('is running', () => {
    const { jobFactory } = getContainer();
    expect(jobFactory.create('example-job', false, false).contextValue).toEqual(
      undefined
    );

    expect(jobFactory.create('example-job', true, false).contextValue).toEqual(
      'isRunning'
    );
  });

  test('is success', () => {
    const { jobFactory } = getContainer();
    const job = jobFactory.create('example', false, false);
    job.setIsSuccess();
    expect(job.description).toEqual('✅');

    job.setIsFailure();
    expect(job.description).toEqual('❌');
  });

  test('is expanded', () => {
    const { editorGateway, jobFactory } = getContainer();
    const job = jobFactory.create('example', false, false);

    job.setExpanded();
    expect(job.collapsibleState).toEqual(
      editorGateway.editor.TreeItemCollapsibleState.Expanded
    );
  });
});
