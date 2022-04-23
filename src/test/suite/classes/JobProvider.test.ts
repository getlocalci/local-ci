import * as assert from 'assert';
import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import TelemetryReporter from '@vscode/extension-telemetry';
import JobProvider from '../../../classes/JobProvider';
import Job from '../../../classes/Job';

suite('JobProvider', () => {
  test('No element passed', () => {
    const context = Substitute.for<vscode.ExtensionContext>();
    const reporter = Substitute.for<TelemetryReporter>();

    assert.deepStrictEqual(
      [],
      new JobProvider(context, reporter).getChildren()
    );
  });

  test('No child', () => {
    const context = Substitute.for<vscode.ExtensionContext>();
    const reporter = Substitute.for<TelemetryReporter>();

    assert.deepStrictEqual(
      [],
      new JobProvider(context, reporter).getChildren(
        new Job('foo', false, false)
      )
    );
  });

  test('Two children', () => {
    const allJobs = new Map();
    allJobs.set('foo', []);
    allJobs.set('baz', ['foo']);
    allJobs.set('example', ['foo']);

    const jobProvider = new JobProvider(
      Substitute.for<vscode.ExtensionContext>(),
      Substitute.for<TelemetryReporter>(),
      allJobs
    );

    const children = jobProvider.getChildren(new Job('foo', false, false));
    assert.strictEqual(2, children.length);

    assert.strictEqual('baz', (children[0] as Job)?.getJobName());
    assert.strictEqual('example', (children[1] as Job)?.getJobName());
  });
});
