import { printSuccessText, checkGitFlowReleaseBranch } from '../../util';
import { getCurrentBranchName, checkoutBranch, createBranch, pushToOrigin } from '../../modules';
import config from '../../config';

const { branchNames } = config;

export const finishRelease = async () => {
  const currentBranchName = await getCurrentBranchName();

  checkGitFlowReleaseBranch(currentBranchName);

  // Retrieve release base branch from RELEASE file in root of repository, throw if it doesn't exist

  // const releaseBaseBranchName =
};
