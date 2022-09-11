import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import TelemetryReporter from '@vscode/extension-telemetry';
import JobFactory from 'job/JobFactory';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import JobProviderFactory from 'job/JobProviderFactory';

function getStubs(): [vscode.ExtensionContext, TelemetryReporter] {
  return [
    Substitute.for<vscode.ExtensionContext>(),
    Substitute.for<TelemetryReporter>(),
  ];
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
    expect(jobProviderFactory.create(...getStubs()).getChildren()).toEqual([]);
  });

  test('no child', () => {
    const provider = jobProviderFactory.create(...getStubs());
    expect(
      provider.getChildren(jobFactory.create('foo', false, false))
    ).toEqual([]);
  });

  test('two children', () => {
    const allJobs = new Map();
    allJobs.set('foo', []);
    allJobs.set('baz', ['foo']);
    allJobs.set('example', ['foo']);

    const children = jobProviderFactory.create(...getStubs(), allJobs).getChildren(
      jobFactory.create('foo', false, false)
    );
    expect(children.length).toEqual(2);

    expect(jobFactory.getJobName(children[0])).toEqual('baz');
    expect(jobFactory.getJobName(children[1])).toEqual('example');
  });
});
