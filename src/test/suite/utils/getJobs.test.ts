import * as assert from 'assert';
import * as fs from 'fs';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import { Substitute } from '@fluffy-spoon/substitute';
import getJobs from '../../../utils/getJobs';
import TelemetryReporter from 'vscode-extension-telemetry';

mocha.afterEach(() => {
  sinon.restore();
});

function getMockContext() {
  return Substitute.for<vscode.ExtensionContext>();
}

suite('getJobs', () => {
  test('Single job', async () => {
    sinon.mock(fs).expects('existsSync').once().returns(true);
    sinon.mock(fs).expects('readFileSync').once().returns('');
    sinon
      .mock(yaml)
      .expects('load')
      .once()
      .returns({
        jobs: {},
        workflows: {
          'test-deploy': {
            jobs: [
              { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
            ],
          },
        },
      });

    assert.strictEqual(
      (
        await getJobs(
          getMockContext(),
          'example-path',
          Substitute.for<TelemetryReporter>(),
          'build'
        )
      ).length,
      1
    );
  });

  test('Multiple jobs', async () => {
    sinon.mock(fs).expects('existsSync').once().returns(true);
    sinon.mock(fs).expects('readFileSync').once().returns('');
    sinon
      .mock(yaml)
      .expects('load')
      .once()
      .returns({
        jobs: {},
        workflows: {
          'test-deploy': {
            jobs: [
              { lint: { docker: [{ image: 'cimg/node:16.8.0' }] } },
              { test: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
              { deploy: { docker: [{ image: 'cimg/node:16.8.0-browsers' }] } },
            ],
          },
        },
      });

    assert.strictEqual(
      (
        await getJobs(
          getMockContext(),
          'example-path',
          Substitute.for<TelemetryReporter>(),
          'build'
        )
      ).length,
      3
    );
  });
});
