import {
  getPackageName,
  getPackageVersion,
  getVersionTagPrefix,
  getNextVersionInfo,
  buildMonorepoFeatureTagPattern,
  buildFeatureTagPattern,
  buildFeaturePrereleaseId,
  publishPackage,
  getFeatureIdFromBranchName,
  isMonorepo as isPackageAMonorepo,
  isPackageMutated,
  printInfo,
  printSuccess,
  printWarning,
} from '../util';
import { getNextVersion } from '../modules/semver';
import {
  getCurrentBranchName,
  fetchMatchingTags,
  getMostRecentMatchingTag,
  getRefHash,
  isAncestor,
  isGitHeadTagged,
} from '../modules';
import config from '../config';

const {
  gitMethodology,
  branchNames: { base, development },
} = config;

export const publishFeature = async () => {
  const packageName = getPackageName();

  printInfo(`Package name is '${packageName}'`);

  const isMonorepo = isPackageAMonorepo();
  const parentBranch = gitMethodology === 'GitFlow' ? development : base;
  const packageVersion = getPackageVersion();
  const tagPrefix = getVersionTagPrefix();
  const branchName = await getCurrentBranchName();
  const featureId = await getFeatureIdFromBranchName();
  const prereleaseVersion = getNextVersion(packageVersion, 'patch');
  const featurePrereleaseId = buildFeaturePrereleaseId(featureId);
  const lastTagPatternPartial = isMonorepo
    ? buildMonorepoFeatureTagPattern(tagPrefix, prereleaseVersion)
    : buildFeatureTagPattern(prereleaseVersion);

  const lastTagPattern = `${lastTagPatternPartial}*`;
  const lastTagPatternStrict = `${lastTagPatternPartial}${featureId}.*`;

  if (isGitHeadTagged(lastTagPatternStrict)) {
    printWarning('Feature tag found at HEAD of this branch, thus no publishing is necessary, exiting...');
    process.exit(0);
  }

  // Git fetch matching remote tags
  await fetchMatchingTags(lastTagPattern);

  // Get last tag
  const lastTag = await getMostRecentMatchingTag(lastTagPattern);
  let ancestor: string;

  if (lastTag) {
    ancestor = lastTag;
    const gitHash = await getRefHash(lastTag);

    if (!isAncestor(gitHash, 'HEAD')) {
      ancestor = parentBranch;
    }
  } else {
    ancestor = parentBranch;
  }

  if (!(await isPackageMutated(ancestor))) {
    printWarning('No changes in the package, exiting...');
    process.exit(0);
  }

  printInfo('Found changes in the package, will commence with publish');

  const { version, tag } = await getNextVersionInfo(lastTag, 'prerelease', featurePrereleaseId);

  await publishPackage(packageName, version, tag);

  printSuccess(`Feature branch ${branchName} successfully publish and tagged`);
  printSuccess(`Version: ${version}`);
  printSuccess(`Tag: ${tag}`);
};
