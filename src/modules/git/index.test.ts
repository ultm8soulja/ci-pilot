import { Chance } from 'chance';

import { getFeatureIdFromBranchName, getVersionTagPrefix } from '../../util';
import config from '../../config';

import { getMostRecentMatchingTag } from '.';

const { ROOT_PACKAGE_JSON_FILE_PATH } = config;

const chance = Chance();

const dummyFeatureId = `${chance.string({ alpha: true, length: 3, casing: 'upper' })}-${chance.integer({
  min: 1,
  max: 999,
})}`;
const dummyBranch = `feature/${dummyFeatureId}`;
const dummyVersion = `${chance.integer({ min: 1, max: 10 })}.${chance.integer({ min: 1, max: 10 })}.${chance.integer({
  min: 1,
  max: 10,
})}`;
const dummyTag = `${getVersionTagPrefix(ROOT_PACKAGE_JSON_FILE_PATH)}${dummyVersion}-alpha.feature.${dummyFeatureId}`;

jest.mock('simple-git/promise', () => {
  return jest.fn().mockImplementation(() => {
    return {
      branchLocal: () => Promise.resolve({ current: dummyBranch }),
      tags: () => Promise.resolve({ latest: `${dummyTag}` }),
    };
  });
});

describe('Git', () => {
  xdescribe('getFeatureIdFromBranchName()', () => {
    it('Returns the name of the Jira ID for the current Git branch', async () => {
      const featureId = await getFeatureIdFromBranchName(ROOT_PACKAGE_JSON_FILE_PATH);

      expect(featureId).toBe(dummyFeatureId);
    });
  });

  describe('getMostRecentMatchingTag()', () => {
    it('Returns the most recent tag matching the patterns', async () => {
      const tag = await getMostRecentMatchingTag(`${dummyTag}*`);

      expect(tag).toBe(dummyTag);
    });
  });
});
