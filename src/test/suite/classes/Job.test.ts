import * as assert from 'assert';
import * as vscode from 'vscode';
import Job from 'classes/Job';

suite('Job', () => {
  test('No element passed', () => {
    const jobName = 'this-is-your-job';
    assert.strictEqual(jobName, new Job(jobName, false, false).getJobName());
  });

  test('Is running', () => {
    assert.strictEqual(
      undefined,
      new Job('example-job', false, false).contextValue
    );
    assert.strictEqual(
      'isRunning',
      new Job('example-job', true, false).contextValue
    );
  });

  test('Is success', () => {
    const job = new Job('example', false, false);
    job.setIsSuccess();
    assert.strictEqual('✅', job.description);

    job.setIsFailure();
    assert.strictEqual('❌', job.description);
  });

  test('Is expanded', () => {
    const job = new Job('example', false, false);
    job.setExpanded();
    assert.strictEqual(
      vscode.TreeItemCollapsibleState.Expanded,
      job.collapsibleState
    );
  });
});
