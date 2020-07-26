import { writeFileSync } from 'fs';
import { promisify } from 'util';

import conventionalRecommendedBump, { Options, Callback } from 'conventional-recommended-bump';

import { printSuccessText, printInfoText, getPackageVersion, detectConventionalCommits } from '../../util';
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
  getRefHash,
} from '../../modules';
import config from '../../config';

import { RELEASE_RELIC_FILENAME, BASE_BRANCH_COMMIT_MSG } from './constants';
import { ReleaseRelic } from './models';

const bump = promisify<Options, Callback.Recommendation>(conventionalRecommendedBump);

const {
  REPO_ROOT_PATH,
  INTERIM_BASE_BRANCH_PREFIX,
  branchNames,
  gitBranchSeparator,
  release: { preset },
} = config;

export const cutRelease = async () => {
  try {
    if (!(await detectConventionalCommits())) {
      throw new Error(
        "The commit messages in this repository don't appear to follow Conventional Commits - can't proceed as this is mandatory"
      );
    }

    /////////////////////////////////////////
    // Create interim base branch
    /////////////////////////////////////////

    const currentBranchName = await getCurrentBranchName();

    if (currentBranchName !== branchNames.base) {
      await checkoutBranch(branchNames.base);
    }

    const interimBaseBranchName = `${INTERIM_BASE_BRANCH_PREFIX}${new Date().getTime()}`;

    await createBranch(interimBaseBranchName);

    await pushToOrigin(interimBaseBranchName);

    printInfoText(`Interim base branch '${interimBaseBranchName}' successfully created and pushed to origin`);

    /////////////////////////////////////////
    // Create release branch
    /////////////////////////////////////////

    const baseBranchShasum = await getRefHash(branchNames.base);
    const developmentBranchShasum = await getRefHash(branchNames.development);

    await checkoutBranch(branchNames.development);

    const { releaseType } = await bump({ preset });

    if (!releaseType) {
      throw new Error('Could not determine the next release type');
    }

    const currentVersion = getPackageVersion(REPO_ROOT_PATH);
    const nextVersion = getNextVersion(currentVersion, releaseType);

    const releaseBranchName = `${branchNames.release}${gitBranchSeparator}${nextVersion}`;

    await createBranch(releaseBranchName);

    // Create release relic

    const relicData: ReleaseRelic = {
      base: baseBranchShasum,
      development: developmentBranchShasum,
      interimBase: interimBaseBranchName,
      release: releaseBranchName,
      predictedVersion: nextVersion,
    };

    writeFileSync(RELEASE_RELIC_FILENAME, JSON.stringify(relicData, undefined, 2));

    await stageFiles([RELEASE_RELIC_FILENAME]);
    await commit(BASE_BRANCH_COMMIT_MSG, [RELEASE_RELIC_FILENAME]);

    await pushToOrigin(releaseBranchName);

    printInfoText(`Next release branch '${releaseBranchName}' successfully created and pushed to origin`);

    await createPullRequest(releaseBranchName, interimBaseBranchName, nextVersion);

    /////////////////////////////////////////
    // Clean-up local branches
    /////////////////////////////////////////

    await checkoutBranch(branchNames.development);
    await deleteLocalBranch(releaseBranchName);
    await deleteLocalBranch(interimBaseBranchName);

    printSuccessText('Operation complete');
  } catch (error) {
    throw new Error(`Problem cutting the release: ${error.message}`);
  }
};
