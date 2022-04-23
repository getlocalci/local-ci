import * as assert from 'assert';
import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import TelemetryReporter from '@vscode/extension-telemetry';
import JobProvider from '../../../classes/JobProvider';
import Job from '../../../classes/Job';

function getStubs(): [vscode.ExtensionContext, TelemetryReporter] {
  return [
    Substitute.for<vscode.ExtensionContext>(),
    Substitute.for<TelemetryReporter>(),
  ];
}

suite('JobProvider', () => {
  test('No element passed', () => {
    assert.deepStrictEqual([], new JobProvider(...getStubs()).getChildren());
  });

  test('No child', () => {
    assert.deepStrictEqual(
      [],
      new JobProvider(...getStubs()).getChildren(new Job('foo', false, false))
    );
  });

  test('Two children', () => {
    const allJobs = new Map();
    allJobs.set('foo', []);
    allJobs.set('baz', ['foo']);
    allJobs.set('example', ['foo']);

    const jobProvider = new JobProvider(...getStubs(), allJobs);

    const children = jobProvider.getChildren(new Job('foo', false, false));
    assert.strictEqual(2, children.length);

    assert.strictEqual('baz', (children[0] as Job)?.getJobName());
    assert.strictEqual('example', (children[1] as Job)?.getJobName());
  });
});
