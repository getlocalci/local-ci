import JobTreeItem from 'job/JobTreeItem';
import getContextStub from 'test-tool/helper/getContextStub';
import getContainer from 'test-tool/TestRoot';

describe('JobProvider', () => {
  test('no element passed', () => {
    const { jobProviderFactory } = getContainer();
    expect(jobProviderFactory.create(getContextStub()).getChildren()).toEqual(
      []
    );
  });

  test('no child', () => {
    const { jobFactory, jobProviderFactory } = getContainer();
    const provider = jobProviderFactory.create(getContextStub());
    expect(
      provider.getChildren(jobFactory.create('foo', false, false))
    ).toEqual([]);
  });

  test('two children', () => {
    const { jobFactory, jobProviderFactory } = getContainer();
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
