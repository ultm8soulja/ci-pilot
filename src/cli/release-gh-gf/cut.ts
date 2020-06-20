import { writeFileSync } from 'fs';
import { promisify } from 'util';

import conventionalRecommendedBump, { Options, Callback } from 'conventional-recommended-bump';

import { printSuccessText, printInfoText, getPackageVersion } from '../../util';
import {
  getCurrentBranchName,
  checkoutBranch,
  createBranch,
  pushToOrigin,
  commit,
  stageFiles,
  getNextVersion,
  deleteLocalBranch,
  createPullRequest,
} from '../../modules';
import config from '../../config';

const bump = promisify<Options, Callback.Recommendation>(conventionalRecommendedBump);

const {
  REPO_ROOT_PATH,
  branchNames,
  gitBranchSeparator,
  release: { preset },
} = config;

export const BASE_BRANCH_COMMIT_MSG = 'chore(release): => Base branch reference';

export const cutRelease = async () => {
  try {
    const currentBranchName = await getCurrentBranchName();

    if (currentBranchName !== branchNames.development) {
      await checkoutBranch(branchNames.development);
    }

    const releaseBaseBranchName = `rc-${new Date().getTime()}-do-not-use`;
    const relicName = 'RELEASE';

    await createBranch(releaseBaseBranchName);

    writeFileSync(relicName, releaseBaseBranchName);

    await stageFiles([relicName]);
    await commit(BASE_BRANCH_COMMIT_MSG, [relicName]);

    await pushToOrigin(releaseBaseBranchName);

    printInfoText(`Base release candidate branch '${releaseBaseBranchName}' successfully created and pushed to origin`);

    // Create release branch

    const { releaseType } = await bump({ preset });

    if (!releaseType) {
      throw new Error('Could not determine the next release type');
    }

    const currentVersion = getPackageVersion(REPO_ROOT_PATH);
    const nextVersion = getNextVersion(currentVersion, releaseType);

    const releaseBranchName = `${branchNames.release}${gitBranchSeparator}${nextVersion}`;

    await createBranch(releaseBranchName);
    await pushToOrigin(releaseBranchName);

    printInfoText(`Next release branch '${releaseBranchName}' successfully created and pushed to origin`);

    await createPullRequest(releaseBaseBranchName, nextVersion);

    // Clean-up local branches

    await checkoutBranch(branchNames.development);
    await deleteLocalBranch(releaseBranchName);
    await deleteLocalBranch(releaseBaseBranchName);

    printSuccessText('Operation complete');
  } catch (error) {
    throw new Error(`Problem cutting the release: ${error.message}`);
  }
};
