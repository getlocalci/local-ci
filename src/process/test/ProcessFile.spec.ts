import * as yaml from 'js-yaml';
import AppTestHarness from 'test-tool/helper/AppTestHarness';
import dynamicConfigExpected from 'test-tool/expected/dynamic-config.yml';
import dyanamicConfigFixture from 'test-tool/fixture/dynamic-config.yml';
import getConfig from 'config/getConfig';
import ProcessFile from 'process/ProcessFile';
import normalize from 'test-tool/helper/normalize';
import simulatedAttachWorkspaceExpected from 'test-tool/expected/simulated-attach-workspace.yml';
import simulatedAttachWorkspaceFixture from 'test-tool/fixture/simulated-attach-workspace.yml';

import withCacheExpected from 'test-tool/expected/with-cache.yml';
import withCacheFixture from 'test-tool/fixture/with-cache.yml';
import Types from 'common/Types';
import Volume from 'containerization/Volume';

let testHarness: AppTestHarness;

describe('ProcessFile', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
  });

  it.each`
    fixture                  | expected                 | name
    ${withCacheFixture}      | ${withCacheExpected}     | ${'withCache'}
    ${dyanamicConfigFixture} | ${dynamicConfigExpected} | ${'dynamicConfig'}
  `(
    'converts $name from \n $fixture \n …to: \n\n $expected',
    ({ fixture, expected }) => {
      const processFile = testHarness.container.get(ProcessFile);

      expect(
        normalize(
          yaml.dump(
            processFile.getWriteableConfig(
              getConfig(fixture) as NonNullable<CiConfig>,
              '/foo/baz/'
            )
          )
        )
      ).toEqual(normalize(expected));
    }
  );

  test('simulates attach_workspace', () => {
    const volume: Volume = testHarness.container.get(Types.IVolume);
    volume.isEmpty = jest.fn(() => true);

    const processFile = testHarness.container.get(ProcessFile);

    expect(
      normalize(
        yaml.dump(
          processFile.getWriteableConfig(
            getConfig(simulatedAttachWorkspaceFixture) as NonNullable<CiConfig>,
            '/foo/baz/'
          ),
          { noRefs: true }
        )
      )
    ).toEqual(normalize(simulatedAttachWorkspaceExpected));
  });
});
