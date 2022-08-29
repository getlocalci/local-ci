import 'reflect-metadata';
import { normalize } from 'test/helpers';
import AppTestHarness from 'test/helpers/AppTestHarness';
import ProcessFile from 'process/ProcessFile';
import { Mock, UnknownFunction } from 'jest-mock';

let testHarness;
let fsGateway: { fs: { writeFileSync: Mock<UnknownFunction>; mkdirSync: Mock<UnknownFunction>; }; };

describe('ProcessFile', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    fsGateway = testHarness.fsGateway;
  });

  test('full config file with cache', () => {
    const processFile = new ProcessFile()
    console.log('here is processfile:', processFile.fsGateway)
    processFile.write(
      '',
      '/foo/baz/'
    );

    expect(fsGateway.fs.mkdirSync).toHaveBeenCalledTimes(1);
    expect(fsGateway.fs.writeFileSync).toHaveBeenCalledWith(
      normalize('')
    );

    // assert.strictEqual(
    //   normalize(writeFileSyncSpy.firstCall.lastArg),
    //   normalize(
    //     fs.readFileSync(getTestFilePath('expected', fileName)).toString()
    //   )
    // );
  });

  // test('dynamic config', () => {
  //   const fileName = 'dynamic-config.yml';
  //   sinon.mock(fs).expects('mkdirSync').once();

  //   const writeFileSyncSpy = sinon.spy();
  //   sinon.stub(fs, 'writeFileSync').value(writeFileSyncSpy);

  //   writeProcessFile(
  //     fs.readFileSync(getTestFilePath('fixture', fileName), 'utf8').toString(),
  //     '/foo/baz/'
  //   );

  //   assert.strictEqual(
  //     normalize(writeFileSyncSpy.firstCall.lastArg),
  //     normalize(
  //       fs.readFileSync(getTestFilePath('expected', fileName)).toString()
  //     )
  //   );
  // });
});
