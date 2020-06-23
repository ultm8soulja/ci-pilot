import {
  checkGfGhBaseReleaseBranch,
  getPackageVersion,
  printSuccessText,
  printInfoText,
  removeBranch,
} from '../../util';
import {
  getCurrentBranchName,
  checkoutBranch,
  merge,
  pushToOrigin,
  moveTag,
  getRefHash,
  getMatchingTagsAtHead,
} from '../../modules';
import config from '../../config';

import { retrieveReleaseRelicData } from './helpers';

const { branchNames, REPO_ROOT_PATH } = config;

const SEMVER_PATTERN = '*[0-9].*[0-9].*[0-9]';

export const finishRelease = async () => {
  try {
    // Ensure the current branch is a release base branch
    const releaseBaseBranchName = checkGfGhBaseReleaseBranch(await getCurrentBranchName());

    // TODO: Check if the last commit on the base branch was from the GitFlow release branch
    if (false) {
      // standardVersion({ dryRun: true, preset: 'angular' });
    }

    const { base } = retrieveReleaseRelicData();
    if ((await getRefHash(base)) === (await getRefHash(releaseBaseBranchName))) {
      throw new Error(`Expected '${releaseBaseBranchName}' to differ from '${branchNames.development}'`);
    }

    // Ensure we're still on release base branch
    await checkoutBranch(releaseBaseBranchName);

    // Check for a git tag on the head of the branch and ensure it matches the version in package.json
    const packageVersion = getPackageVersion(REPO_ROOT_PATH);

    const tags = await getMatchingTagsAtHead(SEMVER_PATTERN);

    if (!tags) {
      throw new Error(`Expected a Git tag at the head of '${releaseBaseBranchName}'`);
    }

    if (tags.length !== 1) {
      throw new Error(`Expected one semver Git tag at the head of '${releaseBaseBranchName}', found ${tags.length}`);
    }

    const tag = tags[0];

    if (tag.indexOf(packageVersion) === -1) {
      throw new Error(
        `Expected Git tag for package version '${packageVersion}' not found on the head of '${releaseBaseBranchName}'`
      );
    }

    printInfoText(`Version tag found on head of '${releaseBaseBranchName}': ${tag}`);

    // Checkout master branch and pull latest version
    await checkoutBranch(branchNames.base);

    await merge(releaseBaseBranchName, branchNames.base);
    await pushToOrigin(branchNames.base);
    printInfoText(`Merged '${releaseBaseBranchName}' into '${branchNames.base}' and pushed to remote`);

    await moveTag(tag, branchNames.base);
    await pushToOrigin(tag, true);
    printInfoText(`Moved tag '${tag}' to head of '${branchNames.base}' and update the remote`);

    // Checkout develop branch and pull latest version
    await checkoutBranch(branchNames.development);

    // Merge rc branch into develop and push to remote
    await merge(releaseBaseBranchName, branchNames.development);
    await pushToOrigin(branchNames.development);
    printInfoText(`Merged '${releaseBaseBranchName}' into '${branchNames.development}' and pushed to remote`);

    // Delete rc base from remote and local
    await removeBranch(releaseBaseBranchName, 'BOTH');

    printSuccessText('Operation complete');
  } catch (error) {
    throw new Error(`Problem finishing the release: ${error.message}`);
  }
};
