import { checkGfGhBaseReleaseBranch, getPackageVersion } from '../../util';
import {
  getCurrentBranchName,
  checkoutBranch,
  merge,
  pushToOrigin,
  isGitHeadTagged,
  moveTag,
  getMostRecentMatchingTag,
  deleteLocalBranch,
  getRefHash,
} from '../../modules';
import config from '../../config';

import {} from './scrap';
import { retrieveReleaseRelicData } from './helpers';

const { branchNames, REPO_ROOT_PATH } = config;

const SEMVER_PATTERN = '*[0-9].*[0-9].*[0-9]';

export const finishRelease = async () => {
  // Ensure the current branch is a release base branch
  const releaseBaseBranchName = checkGfGhBaseReleaseBranch(await getCurrentBranchName());

  // TODO: Check if the last commit on the base branch was from the GitFlow release branch
  if (false) {
    // standardVersion({ dryRun: true, preset: 'angular' });
  }

  const { base } = retrieveReleaseRelicData();
  if ((await getRefHash(base)) !== (await getRefHash(releaseBaseBranchName))) {
    throw new Error(`Expected '${releaseBaseBranchName}' to differ from '${branchNames.development}'`);
  }

  // Ensure we're still on release base branch
  await checkoutBranch(releaseBaseBranchName);

  // Check for a git tag on the head of the branch and ensure it matches the version in package.json
  const version = getPackageVersion(REPO_ROOT_PATH);

  let tag: string;
  const versionError = new Error(
    `Expected Git tag for next version '${version}' not found on the head of '${releaseBaseBranchName}'`
  );
  if (!isGitHeadTagged(SEMVER_PATTERN) || !(tag = (await getMostRecentMatchingTag(version)) as string)) {
    throw versionError;
  }

  if ((await getRefHash(tag)) !== (await getRefHash(releaseBaseBranchName))) {
    throw versionError;
  }

  // Checkout master branch and pull latest version
  await checkoutBranch(branchNames.base);

  // Merge rc base branch into master and push to remote
  await merge(releaseBaseBranchName, branchNames.base);
  await pushToOrigin(branchNames.base);

  // Move tag from head of rc to master head, and push to origin
  await moveTag(tag, branchNames.base);
  await pushToOrigin(tag, true);

  // Checkout develop branch and pull latest version
  await checkoutBranch(branchNames.development);

  // Merge rc branch into develop and push to remote
  await merge(releaseBaseBranchName, branchNames.development);
  await pushToOrigin(branchNames.development);

  // Delete rc base from remote and local
  await deleteLocalBranch(releaseBaseBranchName);
};
