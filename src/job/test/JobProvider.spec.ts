import AppTestHarness from 'test-tools/helper/AppTestHarness';
import getContextStub from 'test-tools/helper/getContextStub';
import JobProviderFactory from 'job/JobProviderFactory';
import JobFactory from 'job/JobFactory';
import JobTreeItem from 'job/JobTreeItem';

let testHarness: AppTestHarness;
let jobProviderFactory: JobProviderFactory;
let jobFactory: JobFactory;

describe('JobProvider', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    jobFactory = testHarness.container.get(JobFactory);
    jobProviderFactory = testHarness.container.get(JobProviderFactory);
  });

  test('no element passed', () => {
    expect(jobProviderFactory.create(getContextStub()).getChildren()).toEqual(
      []
    );
  });

  test('no child', () => {
    const provider = jobProviderFactory.create(getContextStub());
    expect(
      provider.getChildren(jobFactory.create('foo', false, false))
    ).toEqual([]);
  });

  test('two children', () => {
    const allJobs = new Map();
    allJobs.set('foo', []);
    allJobs.set('baz', ['foo']);
    allJobs.set('example', ['foo']);

    const children = jobProviderFactory
      .create(getContextStub(), allJobs)
      .getChildren(jobFactory.create('foo', false, false));

    expect(children.length).toEqual(2);
    expect((children[0] as JobTreeItem).getJobName()).toEqual('baz');
    expect((children[1] as JobTreeItem).getJobName()).toEqual('example');
  });
});
