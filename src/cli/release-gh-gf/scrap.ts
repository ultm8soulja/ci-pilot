import { printSuccessText, checkGitFlowReleaseBranch, removeBranch } from '../../util';
import { getCurrentBranchName, checkoutBranch, fetchBranch } from '../../modules';
import config from '../../config';

import { retrieveReleaseRelicData } from './helpers';

const { branchNames } = config;

const checkoutReleaseBranch = async () => {
  try {
    const currentBranchName = await getCurrentBranchName();

    checkGitFlowReleaseBranch(currentBranchName);
    await checkoutBranch(currentBranchName);
  } catch (error) {
    throw new Error(`Error checking out the release branch to be scrapped - ${error.message}`);
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
