import EditorGateway from 'gateway/EditorGateway';
import JobFactory from 'job/JobFactory';
import getContainer from 'test-tool/TestRoot';

let editorGateway: EditorGateway;
let jobFactory: JobFactory;

describe('Job', () => {
  beforeEach(() => {
    const container = getContainer();
    jobFactory = container.jobFactory;
    editorGateway = container.editorGateway;
  });

  test('no element passed', () => {
    const jobName = 'this-is-your-job';
    expect(jobFactory.create(jobName, false, false).getJobName()).toEqual(
      jobName
    );
  });

  test('is running', () => {
    expect(jobFactory.create('example-job', false, false).contextValue).toEqual(
      undefined
    );

    expect(jobFactory.create('example-job', true, false).contextValue).toEqual(
      'isRunning'
    );
  });

  test('is success', () => {
    const job = jobFactory.create('example', false, false);
    job.setIsSuccess();
    expect(job.description).toEqual('✅');

    job.setIsFailure();
    expect(job.description).toEqual('❌');
  });

  test('is expanded', () => {
    const job = jobFactory.create('example', false, false);

    job.setExpanded();
    expect(job.collapsibleState).toEqual(
      editorGateway.editor.TreeItemCollapsibleState.Expanded
    );
  });
});
