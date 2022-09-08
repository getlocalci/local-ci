import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import TelemetryReporter from '@vscode/extension-telemetry';
import JobFactory from 'job/JobFactory';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import JobProviderFactory from 'job/JobProviderFactory';
import Types from 'common/Types';

function getStubs(): [vscode.ExtensionContext, TelemetryReporter] {
  return [
    Substitute.for<vscode.ExtensionContext>(),
    Substitute.for<TelemetryReporter>(),
  ];
}

let testHarness: AppTestHarness;
let jobProviderFactory: ReturnType<typeof JobProviderFactory>;
let jobFactory: JobFactory;

describe('JobProvider', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    jobFactory = testHarness.container.get(JobFactory);
    jobProviderFactory = testHarness.container.get(Types.IJobProviderFactory);
  });

  test('No element passed', () => {
    expect(jobProviderFactory(...getStubs()).getChildren()).toEqual([]);
  });

  test('No child', async () => {
    const provider = jobProviderFactory(...getStubs());
    expect(
      provider.getChildren(jobFactory.create('foo', false, false))
    ).toEqual([]);
  });

  test('Two children', () => {
    const allJobs = new Map();
    allJobs.set('foo', []);
    allJobs.set('baz', ['foo']);
    allJobs.set('example', ['foo']);

    const children = jobProviderFactory(...getStubs(), allJobs).getChildren(
      jobFactory.create('foo', false, false)
    );
    expect(children.length).toEqual(2);

    expect(jobFactory.getJobName(children[0] as vscode.TreeItem)).toEqual(
      'baz'
    );
    expect(jobFactory.getJobName(children[1] as vscode.TreeItem)).toEqual(
      'example'
    );
  });
});
