import * as yaml from 'js-yaml';
import dynamicConfigExpected from 'test-tool/expected/dynamic-config.yml';
import dyanamicConfigFixture from 'test-tool/fixture/dynamic-config.yml';
import getConfig from 'config/getConfig';
import normalize from 'test-tool/helper/normalize';
import simulatedAttachWorkspaceExpected from 'test-tool/expected/simulated-attach-workspace.yml';
import simulatedAttachWorkspaceFixture from 'test-tool/fixture/simulated-attach-workspace.yml';
import withCacheExpected from 'test-tool/expected/with-cache.yml';
import withCacheFixture from 'test-tool/fixture/with-cache.yml';
import getContainer from 'test-tool/TestRoot';
import Volume from 'containerization/Volume';
import Persistence from 'process/Persistence';
import ProcessFile from 'process/ProcessFile';

describe('ProcessFile', () => {
  it.each`
    fixture                  | expected                 | name
    ${withCacheFixture}      | ${withCacheExpected}     | ${'withCache'}
    ${dyanamicConfigFixture} | ${dynamicConfigExpected} | ${'dynamicConfig'}
  `(
    'converts $name from \n $fixture \n …to: \n\n $expected',
    ({ fixture, expected }) => {
      const { envVar, fsGateway } = getContainer();
      const volume = new Volume(fsGateway);
      volume.isEmpty = jest.fn(() => false);
      const persistence = new Persistence(volume);
      const processFile = new ProcessFile(envVar, fsGateway, persistence);

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
    const { envVar, fsGateway } = getContainer();
    const volume = new Volume(fsGateway);
    volume.isEmpty = jest.fn(() => true);
    const persistence = new Persistence(volume);
    const processFile = new ProcessFile(envVar, fsGateway, persistence);

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
