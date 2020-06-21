import { readFileSync } from 'fs';

import { printSuccessText, checkGfGhBaseReleaseBranch, checkGitFlowReleaseBranch, removeBranch } from '../../util';
import { getCurrentBranchName, checkoutBranch, fetchBranch } from '../../modules';
import config from '../../config';

import { RELEASE_RELIC_FILENAME } from './constants';
import { ReleaseRelic } from './models';

const { branchNames } = config;

const checkoutReleaseBranch = async () => {
  try {
    const currentBranchName = await getCurrentBranchName();

    try {
      checkGfGhBaseReleaseBranch(currentBranchName);

      throw new Error('Must checkout the actual release branch, not the release candidate base branch');
    } catch (error) {
      checkGitFlowReleaseBranch(currentBranchName);
      checkGitFlowReleaseBranch(currentBranchName);
    }

    await checkoutBranch(currentBranchName);
  } catch (error) {
    throw new Error(`Error checking out the release branch to be scrapped - ${error.message}`);
  }
};

const retrieveReleaseRelicData = (): ReleaseRelic => {
  try {
    const relicStr = readFileSync(RELEASE_RELIC_FILENAME).toString();
    return JSON.parse(relicStr);
  } catch (error) {
    throw new Error(`Error retrieving the release relic - ${error.message}`);
  }
};

export const scrapRelease = async () => {
  try {
    await checkoutReleaseBranch();

    const { release, releaseBase } = retrieveReleaseRelicData();

    await fetchBranch(releaseBase);

    // TODO: find and remove and tags on the release branch

    await checkoutBranch(branchNames.development);

    await removeBranch(release, 'BOTH');

    await removeBranch(releaseBase, 'BOTH');

    printSuccessText('Operation complete');
  } catch (error) {
    throw new Error(`Problem scrapping the release: ${error.message}`);
  }
};
