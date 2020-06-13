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
} from '../../modules';
import config from '../../config';

const { branchNames, PACKAGE_JSON_FILE_PATH } = config;

export const finishRelease = async () => {
  // Ensure the current branch is a release base branch
  const releaseBaseBranchName = checkGfGhBaseReleaseBranch(await getCurrentBranchName());

  // TODO: Check if the last commit on the base branch was from the GitFlow release branch
  if (false) {
    // standardVersion({ dryRun: true, preset: 'angular' });
  }

  // Ensure we're still on release base branch
  await checkoutBranch(releaseBaseBranchName);

  // Check version from package.json and ensure a git tag of the same name exists locally
  const version = getPackageVersion(PACKAGE_JSON_FILE_PATH);

  let tag: string;
  if (!isGitHeadTagged(version) || !(tag = (await getMostRecentMatchingTag(version)) as string)) {
    throw new Error(
      `Expected Git tag for next version '${version}' not found on the head of '${releaseBaseBranchName}'`
    );
  }

  // Checkout master branch and pull latest version
  await checkoutBranch(branchNames.base);

  // Merge rc base branch into master and push to remote
  await merge(releaseBaseBranchName, branchNames.base);
  await pushToOrigin(branchNames.base);

  // Move tag from head of rc to master head, and push to origin
  await moveTag(tag, branchNames.base);

  // Checkout develop branch and pull latest version
  await checkoutBranch(branchNames.development);

  // Merge rc branch into develop and push to remote
  await merge(releaseBaseBranchName, branchNames.development);
  await pushToOrigin(branchNames.development);

  // Delete rc base from remote and local
  await deleteLocalBranch(releaseBaseBranchName);
};
