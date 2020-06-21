import { readFileSync } from 'fs';

import { printSuccessText, checkGfGhBaseReleaseBranch, checkGitFlowReleaseBranch, removeBranch } from '../../util';
import { getCurrentBranchName, checkoutBranch } from '../../modules';
import config from '../../config';

import { RELEASE_RELIC_FILENAME } from './constants';
import { ReleaseRelic } from './models';

const { branchNames } = config;

const checkoutReleaseBranch = async () => {
  try {
    const currentBranchName = await getCurrentBranchName();
    let branchType: 'base' | 'release';

    try {
      checkGfGhBaseReleaseBranch(currentBranchName);
      branchType = 'base';
    } catch (error) {
      checkGitFlowReleaseBranch(currentBranchName);
      branchType = 'release';
    }

    if (branchType === 'base') {
      await checkoutBranch(currentBranchName);
    }
  } catch (error) {
    throw new Error(`Problem checking out the release branch to be scrapped: ${error.message}`);
  }
};

const retrieveReleaseRelicData = (): ReleaseRelic => {
  try {
    const relicStr = readFileSync(RELEASE_RELIC_FILENAME).toString();
    return JSON.parse(relicStr);
  } catch (error) {
    throw new Error(`Problem retrieving the release relic: ${error.message}`);
  }
};

export const scrapRelease = async () => {
  try {
    await checkoutReleaseBranch();

    const { release, releaseBase } = retrieveReleaseRelicData();

    // TODO: find and remove and tags on the release branch

    await checkoutBranch(branchNames.development);

    await removeBranch(release);

    await removeBranch(releaseBase);

    printSuccessText('Operation complete');
  } catch (error) {
    throw new Error(`Problem scrapping the release: ${error.message}`);
  }
};