import { printSuccessText } from '../../util';
import { getCurrentBranchName, checkoutBranch, createBranch, pushToOrigin } from '../../modules';
import config from '../../config';

const { branchNames } = config;

export const initRelease = async () => {
  const currentBranchName = await getCurrentBranchName();

  if (currentBranchName !== branchNames.development) {
    await checkoutBranch(branchNames.development);
  }

  const releaseInitBranchName = `rc-${new Date().getTime()}-do-not-use`;

  await createBranch(releaseInitBranchName);

  await pushToOrigin(releaseInitBranchName);

  await checkoutBranch(branchNames.development);

  printSuccessText(`Base release candidate branch ${releaseInitBranchName} successfully created and pushed to origin`);
};
