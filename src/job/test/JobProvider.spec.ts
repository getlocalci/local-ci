import getContextStub from 'test-tool/helper/getContextStub';
import JobProviderFactory from 'job/JobProviderFactory';
import JobFactory from 'job/JobFactory';
import JobTreeItem from 'job/JobTreeItem';
import container from 'common/TestAppRoot';

let jobProviderFactory: JobProviderFactory;
let jobFactory: JobFactory;

describe('JobProvider', () => {
  beforeEach(() => {
    jobFactory = container.jobFactory;
    jobProviderFactory = container.jobProviderFactory;
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
