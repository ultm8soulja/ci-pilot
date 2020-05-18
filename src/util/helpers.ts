import fs, { readdirSync, statSync } from 'fs';
import { join } from 'path';

import { DepGraph } from 'dependency-graph';
import { echo, exit, ShellString } from 'shelljs';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { ReleaseType } from 'semver';

import config from '../config';
import { NextVersionInfo, PackageJson } from '../models';
import {
  getCurrentBranchName,
  getDiff,
  getNextVersion,
  isNpmInstalled,
  isYarnInstalled,
  bumpVersion,
  createTag,
  pushToOrigin,
  reset,
  publish,
  isGitHeadTagged,
  fetchMatchingTags,
  getMostRecentMatchingTag,
  getRefHash,
  isAncestor,
} from '../modules';

import { printInfoText, printErrorText, printSuccessText, printWarningText } from './console';

const {
  tagSeparator,
  FEATURE_BRANCH_REGEX,
  LERNA_CONFIG_FILE_PATH,
  PACKAGE_ROOT_PATH,
  REPO_ROOT_PATH,
  ROOT_PACKAGE_JSON_FILE_PATH,
  SEMVER_ALPHA_PRERELEASE_ID_PREFIX,
  SEMVER_FEATURE_PRERELEASE_ID_PREFIX,
  PACKAGE_JSON_FILE,
  packageManager,
  gitMethodology,
  branchNames: { base, development },
} = config;

export const getPackage = (packagePath: string) => {
  const packageJson: JSONSchemaForNPMPackageJsonFiles = JSON.parse(
    fs.readFileSync(`${packagePath}/${PACKAGE_JSON_FILE}`, { encoding: 'utf-8' })
  );
  return packageJson;
};

export const getPackageName = (packagePath: string) => {
  const name = getPackage(packagePath).name;

  if (!name) {
    throw new Error('Name not found in package');
  }

  return name;
};

export const getPackageVersion = (packagePath: string) => {
  const version = getPackage(packagePath).version;

  if (!version) {
    throw new Error('Version not found in package');
  }

  return version;
};

export const printInfo = (message: string, packageName: string) => {
  printInfoText(`(${packageName}): ${message}`);
};

export const printWarning = (message: string, packageName: string) => {
  printWarningText(`(${packageName}): ${message}`);
};

export const printError = (message: string, packageName: string) => {
  printErrorText(`(${packageName}): ${message}`);
};

export const printSuccess = (message: string, packageName: string) => {
  printSuccessText(`(${packageName}): ${message}`);
};

export const checkState = ({ code, stderr }: ShellString) => {
  if (code !== 0) {
    echo(`The command failed (${stderr}), exiting...`);
    exit(1);
  }
};

export const isFeatureBranch = (branch: string) => {
  const results = FEATURE_BRANCH_REGEX.exec(branch);

  if (!results) {
    throw new Error(`'${branch}' is not a feature branch`);
  }

  return results[1];
};

export const getFeatureIdFromBranchName = async (packagePath: string) => {
  const packageName = getPackageName(packagePath);
  const current = await getCurrentBranchName();

  if (!current) {
    throw new Error('Current branch not available');
  }

  const featureId = isFeatureBranch(current);

  printInfo(`Feature ID for branch '${current}' is ${featureId}`, packageName);
  return featureId;
};

export const getYarnWorkspaces = (rootPath: string) => getPackage(rootPath).workspaces;

export const isYarnWsMonorepo = (rootPath: string) => {
  const workspaces = getYarnWorkspaces(rootPath);
  return workspaces && workspaces.length > 0 ? true : false;
};

// export const getLernaWorkspaces = (packagePath: string) => getPackage(packagePath).workspaces;

export const isLernaMonorepo = () => {
  return fs.existsSync(LERNA_CONFIG_FILE_PATH);
};

export const isMonorepo = () => {
  return isLernaMonorepo() || isYarnWsMonorepo(REPO_ROOT_PATH) ? true : false;
};

export const getVersionTagPrefix = (packagePath: string) => {
  return isMonorepo() ? `${getPackageName(packagePath)}${tagSeparator}` : '';
};

export const buildFeatureTagPattern = (version: string) => {
  return `${version}-${SEMVER_FEATURE_PRERELEASE_ID_PREFIX}`;
};

export const buildAlphaTagPattern = (version: string) => {
  return `${version}-${SEMVER_ALPHA_PRERELEASE_ID_PREFIX}`;
};

export const buildFeaturePrereleaseId = (featureId: string) => {
  return `${SEMVER_FEATURE_PRERELEASE_ID_PREFIX}${featureId}`;
};

export const buildAlphaPrereleaseId = (featureId: string) => {
  return `${SEMVER_ALPHA_PRERELEASE_ID_PREFIX}${featureId}`;
};

export const buildMonorepoFeatureTagPattern = (tagPrefix: string, version: string) => {
  return `${tagPrefix}${version}-${SEMVER_FEATURE_PRERELEASE_ID_PREFIX}`;
};

export const buildMonorepoAlphaTagPattern = (tagPrefix: string, version: string) => {
  return `${tagPrefix}${version}-${SEMVER_ALPHA_PRERELEASE_ID_PREFIX}`;
};

export const getNextVersionInfo = async (
  packagePath: string,
  lastTag: string | undefined,
  type: ReleaseType,
  preReleaseId: string
): Promise<NextVersionInfo> => {
  const packageName = getPackageName(packagePath);
  const packageVersion = getPackageVersion(packagePath);
  const tagPrefix = getVersionTagPrefix(packagePath);

  printInfo('Identify the next version and tag', packageName);

  let nextVersion: string;
  if (lastTag) {
    const lastVersion = lastTag.replace(tagPrefix, '');
    nextVersion = getNextVersion(lastVersion, type);
  } else {
    nextVersion = getNextVersion(packageVersion, type, preReleaseId);
  }

  const nextTag = `${tagPrefix}${nextVersion}`;

  printInfo(`Next version: ${nextVersion}, next tag: ${nextTag}`, packageName);

  return { lastTag, tag: nextTag, version: nextVersion };
};

export const isPackageMutated = async (packagePath: string, ancestorRef: string) => {
  const packageName = getPackageName(packagePath);
  const relativePackagePathFromRepoRoot = PACKAGE_ROOT_PATH.replace(REPO_ROOT_PATH, '').replace(/^(\/)/, '');
  printInfo(`relativePackagePathFromRepoRoot: ${relativePackagePathFromRepoRoot}`, packageName);
  const pattern = new RegExp(relativePackagePathFromRepoRoot);
  const lines = await getDiff(ancestorRef);

  if (!lines) {
    return false;
  }

  return lines.filter(line => pattern.test(line)).length > 0;
};

export const isPackageManagerInstalled = () => {
  if (packageManager === 'npm') {
    return isNpmInstalled();
  } else {
    return isYarnInstalled();
  }
};

export const getMonorepoWorkspacePackages = (workspacePath: string) => {
  const directories = readdirSync(workspacePath).filter(f => statSync(join(workspacePath, f)).isDirectory());

  return directories
    .map(dir => {
      try {
        const packagePath = `${workspacePath}/${dir}`;
        const myPackage: PackageJson = {
          packagePath,
          ...getPackage(packagePath),
        };
        return myPackage;
      } catch (error) {
        return undefined;
      }
    })
    .filter(<TValue>(value: TValue | null | undefined): value is TValue => {
      return value !== null && value !== undefined;
    });
};

export const buildPackageDependencyGraph = (packages: PackageJson[]) => {
  const graph = new DepGraph();

  const packageNames: string[] = [];
  packages.forEach(p => {
    if (p.name) {
      packageNames.push(p.name);
      graph.addNode(p.name, p);
    }
  });

  for (const p of packages) {
    const packageName = p.name;

    if (!packageName) {
      continue;
    }

    for (const name of packageNames) {
      if (packageName === name) {
        continue;
      }

      if (p.dependencies && p.dependencies[name]) {
        graph.addDependency(packageName, name);
      } else if (p.devDependencies && p.devDependencies[name]) {
        graph.addDependency(packageName, name);
      }
    }
  }

  return graph;
};

export const gitVersionAndTag = async (packagePath: string, { version, tag }: NextVersionInfo, commitToGit = false) => {
  const packageName = getPackageName(packagePath);
  printInfo(`Finalising version, bumping to ${version} (tag: ${tag})`, packageName);

  printInfo('Set the version for the package, and tag HEAD with the same version', packageName);
  bumpVersion(version, false);

  if (commitToGit) {
    // TODO: Add commit function to git module
  }

  await createTag(tag);
  await pushToOrigin(tag);
};

export const gitCleanWorkingDirectory = async () => {
  printInfoText('Clean-up Git working directory');
  await reset('hard');
};

export const publishPackage = async (packagePath: string, nextTag: string) => {
  const packageName = getPackageName(packagePath);
  printInfo('Publish package and push new tag to remote', packageName);
  const npmDistTag = isMonorepo() ? nextTag : `tag${tagSeparator}${nextTag}`;
  publish(packagePath, npmDistTag);
};

export const finaliseVersion = async (packagePath: string, versionInfo: NextVersionInfo, commitToGit = false) => {
  await gitVersionAndTag(packagePath, versionInfo, commitToGit);
  await pushToOrigin(versionInfo.tag);

  if (!commitToGit) {
    await gitCleanWorkingDirectory();
  }
};

export const finaliseVersionAndPublish = async (
  packagePath: string,
  versionInfo: NextVersionInfo,
  commitToGit = false
) => {
  await gitVersionAndTag(packagePath, versionInfo, commitToGit);
  await pushToOrigin(versionInfo.tag);
  await publishPackage(packagePath, versionInfo.tag);
  await gitCleanWorkingDirectory();
};

export const prepareNextFeatureVersion = async (packagePath: string) => {
  const packageName = getPackageName(packagePath);
  const parentBranch = gitMethodology === 'GitFlow' ? development : base;
  const packageVersion = getPackageVersion(packagePath);
  const tagPrefix = getVersionTagPrefix(packagePath);
  const featureId = await getFeatureIdFromBranchName(packagePath);
  const prereleaseVersion = getNextVersion(packageVersion, 'patch');
  const featurePrereleaseId = buildFeaturePrereleaseId(featureId);
  const lastTagPatternPartial = isMonorepo()
    ? buildMonorepoFeatureTagPattern(tagPrefix, prereleaseVersion)
    : buildFeatureTagPattern(prereleaseVersion);

  // const lastTagPattern = `${lastTagPatternPartial}*`;
  const lastTagPatternStrict = `${lastTagPatternPartial}${featureId}.*`;

  if (isGitHeadTagged(lastTagPatternStrict)) {
    printWarning('Feature tag found at HEAD of this branch, thus no publishing is necessary, exiting...', packageName);
    return;
  }

  // Git fetch matching remote tags
  await fetchMatchingTags(lastTagPatternStrict);

  // Get last tag
  const lastTag = await getMostRecentMatchingTag(lastTagPatternStrict);
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

  if (!(await isPackageMutated(packagePath, ancestor))) {
    printWarning('No changes in the package, exiting...', packageName);
    return;
  }

  printInfo('Found changes in the package, will commence with publish', packageName);

  return await getNextVersionInfo(packagePath, lastTag, 'prerelease', featurePrereleaseId);
};

export const getMonorepoPackages = async () => {
  const yarnWorkspaces = getYarnWorkspaces(ROOT_PACKAGE_JSON_FILE_PATH);
  const workspaces: string[] = [];

  if (yarnWorkspaces) {
    yarnWorkspaces.forEach(ws => workspaces.push(ws.replace('/*', '')));
  } /*  else if (isLernaMonorepo()) {
      
    } */ else {
    throw new Error('Could not find mono-repo workspaces');
  }

  return workspaces
    .map(ws => getMonorepoWorkspacePackages(`${REPO_ROOT_PATH}/${ws}`))
    .reduce((acc, val) => acc.concat(val), []);
};
