import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { getTestFilePath } from '../../helpers';
import replaceDynamicConfigOrb from '../../../utils/replaceDynamicConfigOrb';
import getConfigFromPath from '../../../utils/getConfigFromPath';

mocha.afterEach(() => {
  sinon.restore();
});

suite('replaceDynamicConfigOrb', () => {
  test('Dynamic config file', () => {
    assert.deepStrictEqual(
      replaceDynamicConfigOrb(
        getConfigFromPath(getTestFilePath('fixture', 'dynamic-config.yml'))
      ),
      getConfigFromPath(getTestFilePath('expected', 'dynamic-config.yml'))
    );
  });

  test('Non dynamic config file should not be changed', () => {
    const testFile = getTestFilePath('fixture', 'with-cache.yml');

    assert.deepStrictEqual(
      replaceDynamicConfigOrb(getConfigFromPath(testFile)),
      getConfigFromPath(testFile)
    );
  });
});
