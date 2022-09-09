import JobFactory from 'job/JobFactory';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import FakeEditorGateway from 'common/FakeEditorGateway';

let testHarness: AppTestHarness;
let jobFactory: JobFactory;
let editorGateway: FakeEditorGateway;

describe('Job', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    jobFactory = testHarness.container.get(JobFactory);
    editorGateway = testHarness.editorGateway;
  });

  test('no element passed', () => {
    const jobName = 'this-is-your-job';
    expect(
      jobFactory.getJobName(jobFactory.create(jobName, false, false))
    ).toEqual(jobName);
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
    expect(jobFactory.setIsSuccess(job).description).toEqual('✅');

    expect(jobFactory.setIsFailure(job).description).toEqual('❌');
  });

  test('is expanded', () => {
    const job = jobFactory.create('example', false, false);

    expect(jobFactory.setExpanded(job).collapsibleState).toEqual(
      editorGateway.editor.TreeItemCollapsibleState.Expanded
    );
  });
});
