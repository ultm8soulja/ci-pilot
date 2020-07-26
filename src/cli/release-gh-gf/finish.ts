import standardVersion from 'standard-version';

import {
  checkGfGhInterimBaseBranch,
  getPackageVersion,
  printSuccessText,
  printInfoText,
  removeBranch,
  printWarningText,
} from '../../util';
import {
  getCurrentBranchName,
  checkoutBranch,
  merge,
  pushToOrigin,
  moveTag,
  getRefHash,
  getMatchingTagsAtHead,
  createBranch,
  cherryPickCommits,
} from '../../modules';
import config from '../../config';

import { retrieveReleaseRelicData } from './helpers';
import { BUMP_COMMIT_MESSAGE, SEMVER_PATTERN } from './constants';

const {
  branchNames,
  REPO_ROOT_PATH,
  release: { preset, tagPrefix },
} = config;

export const finishRelease = async (autoBump: boolean, mergeMsgSkipCi = false) => {
  try {
    // Ensure the current branch is a interim base branch
    // TODO: auto-discover the interim base branch
    const interimBaseBranchName = checkGfGhInterimBaseBranch(await getCurrentBranchName());

    // TODO: Check if the last commit on the base branch was from the GitFlow release branch???

    const { base, development, release } = retrieveReleaseRelicData();
    if ((await getRefHash(base)) === (await getRefHash(interimBaseBranchName))) {
      throw new Error(`Expected '${interimBaseBranchName}' to differ from '${branchNames.base}'`);
    }

    /////////////////////////////////////////
    // Versioning
    /////////////////////////////////////////

    if (autoBump) {
      try {
        await standardVersion({ preset, releaseCommitMessageFormat: BUMP_COMMIT_MESSAGE, noVerify: true, tagPrefix });
      } catch (error) {
        throw new Error(`standard-version failed: ${error.message}`);
      }
    } else {
      printWarningText(
        `release-gh-gf has an optional --auto-bump-change-log (or -a) flag that will version and generate/update the change log on your behalf.\nYou've chosen not to use it thus we expect the head of ${interimBaseBranchName} to be Git tagged with a version that matches that in 'package.json'.`
      );
    }

    /////////////////////////////////////////
    // Check tags
    /////////////////////////////////////////

    await checkoutBranch(interimBaseBranchName);

    // Check for a git tag on the head of the branch and ensure it matches the version in package.json
    const packageVersion = getPackageVersion(REPO_ROOT_PATH);

    const tags = await getMatchingTagsAtHead(SEMVER_PATTERN);

    if (!tags) {
      throw new Error(`Expected a Git tag at the head of '${interimBaseBranchName}'`);
    }

    if (tags.length !== 1) {
      throw new Error(`Expected one semver Git tag at the head of '${interimBaseBranchName}', found ${tags.length}`);
    }

    const tag = tags[0];

    if (tag.indexOf(packageVersion) === -1) {
      throw new Error(
        `Expected Git tag for package version '${packageVersion}' not found on the head of '${interimBaseBranchName}'`
      );
    }

    printInfoText(`Version tag found on head of '${interimBaseBranchName}': ${tag}`);

    /////////////////////////////////////////
    // Re-create release branch
    /////////////////////////////////////////

    await checkoutBranch(development, false);
    await createBranch(release);
    await cherryPickCommits(development, interimBaseBranchName);
    await moveTag(tag, release);

    /////////////////////////////////////////
    // Finalise GitFlow release
    /////////////////////////////////////////

    // Checkout master branch and pull latest version
    await checkoutBranch(branchNames.base);

    let mergeCommitMsg = `chore(release): => Merged for ${tag} release`;
    await merge(release, branchNames.base, mergeCommitMsg);
    await pushToOrigin(branchNames.base);
    printInfoText(`Merged '${release}' into '${branchNames.base}' and pushed to remote`);

    await moveTag(tag, branchNames.base);
    await pushToOrigin(tag, true);
    printInfoText(`Moved tag '${tag}' to head of '${branchNames.base}' and update the remote`);

    // Checkout develop branch and pull latest version
    await checkoutBranch(branchNames.development);

    // Merge rc branch into develop and push to remote
    mergeCommitMsg = `chore(release): => Merged for ${tag} release${mergeMsgSkipCi ? ' [skip ci]' : ''}`;
    await merge(release, branchNames.development, mergeCommitMsg);
    await pushToOrigin(branchNames.development);
    printInfoText(`Merged '${release}' into '${branchNames.development}' and pushed to remote`);

    /////////////////////////////////////////
    // Clean-up after release
    /////////////////////////////////////////

    await removeBranch(release, 'BOTH');
    await removeBranch(interimBaseBranchName, 'BOTH');

    printSuccessText('Operation complete');
  } catch (error) {
    throw new Error(`Problem finishing the release: ${error.message}`);
  }
};
