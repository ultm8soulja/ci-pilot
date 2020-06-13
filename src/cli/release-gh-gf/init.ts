import { writeFileSync } from 'fs';

import { printSuccessText } from '../../util';
import { getCurrentBranchName, checkoutBranch, createBranch, pushToOrigin, commit, stageFiles } from '../../modules';
import config from '../../config';

const { branchNames } = config;

export const initRelease = async () => {
  const currentBranchName = await getCurrentBranchName();

  if (currentBranchName !== branchNames.development) {
    await checkoutBranch(branchNames.development);
  }

  const releaseBaseBranchName = `rc-${new Date().getTime()}-do-not-use`;
  const relicName = 'RELEASE';

  await createBranch(releaseBaseBranchName);

  writeFileSync(relicName, releaseBaseBranchName);

  await stageFiles([relicName]);
  await commit('chore(release): => Base branch reference', [relicName]);

  await pushToOrigin(releaseBaseBranchName);

  await checkoutBranch(branchNames.development);

  printSuccessText(
    `Base release candidate branch '${releaseBaseBranchName}' successfully created and pushed to origin`
  );
};
