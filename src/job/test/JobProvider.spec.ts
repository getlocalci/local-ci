import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import JobFactory from 'job/JobFactory';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import JobProviderFactory from 'job/JobProviderFactory';
import JobTreeItem from 'job/JobTreeItem';

function getStub() {
  return Substitute.for<vscode.ExtensionContext>();
}

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
    expect(jobProviderFactory.create(getStub()).getChildren()).toEqual([]);
  });

  test('no child', () => {
    const provider = jobProviderFactory.create(getStub());
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
      .create(getStub(), allJobs)
      .getChildren(jobFactory.create('foo', false, false));

    expect(children.length).toEqual(2);
    expect((children[0] as JobTreeItem).getJobName()).toEqual('baz');
    expect((children[1] as JobTreeItem).getJobName()).toEqual('example');
  });
});
