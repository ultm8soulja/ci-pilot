import fs from 'fs';

import { echo, exit, ShellString } from 'shelljs';
import { JSONSchemaForNPMPackageJsonFiles as PackageJson } from '@schemastore/package';
import { ReleaseType } from 'semver';

import config from '../config';
import { NextVersionInfo } from '../models';
import { getCurrentBranchName, getDiff, getNextVersion, isNpmInstalled, isYarnInstalled } from '../modules';

import { printInfoText, printErrorText, printSuccessText, printWarningText } from './console';

const {
  tagSeparator,
  FEATURE_BRANCH_REGEX,
  PACKAGE_JSON_PATH,
  LERNA_CONFIG_PATH,
  PACKAGE_ROOT_PATH,
  REPO_ROOT_PATH,
  SEMVER_ALPHA_PRERELEASE_ID_PREFIX,
  SEMVER_FEATURE_PRERELEASE_ID_PREFIX,
  packageManager,
} = config;

export const getPackage = () => {
  const packageJson: PackageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, { encoding: 'utf-8' }));
  return packageJson;
};

export const getPackageName = () => {
  const name = getPackage().name;

  if (!name) {
    throw new Error('Name not found in package');
  }

  return name;
};

export const getPackageVersion = () => {
  const version = getPackage().version;

  if (!version) {
    throw new Error('Version not found in package');
  }

  return version;
};

export const printInfo = (message: string, packageName?: string) => {
  if (!packageName) {
    packageName = getPackageName();
  }
  printInfoText(`(${packageName}): ${message}`);
};

export const printWarning = (message: string, packageName?: string) => {
  if (!packageName) {
    packageName = getPackageName();
  }
  printWarningText(`(${packageName}): ${message}`);
};

export const printError = (message: string, packageName?: string) => {
  if (!packageName) {
    packageName = getPackageName();
  }
  printErrorText(`(${packageName}): ${message}`);
};

export const printSuccess = (message: string, packageName?: string) => {
  if (!packageName) {
    packageName = getPackageName();
  }
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

export const getFeatureIdFromBranchName = async () => {
  const packageName = getPackageName();
  const current = await getCurrentBranchName();

  if (!current) {
    throw new Error('Current branch not available');
  }

  const featureId = isFeatureBranch(current);

  printInfo(`Feature ID for branch '${current}' is ${featureId}`, packageName);
  return featureId;
};

export const isMonorepo = () => {
  return fs.existsSync(LERNA_CONFIG_PATH) || getPackage().workspaces ? true : false;
};

export const getVersionTagPrefix = () => {
  return isMonorepo() ? `${getPackageName()}${tagSeparator}` : '';
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
  lastTag: string | undefined,
  type: ReleaseType,
  preReleaseId: string
): Promise<NextVersionInfo> => {
  const packageName = getPackageName();
  const packageVersion = getPackageVersion();
  const tagPrefix = getVersionTagPrefix();

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

export const isPackageMutated = async (ancestorRef: string) => {
  const relativePackagePathFromRepoRoot = PACKAGE_ROOT_PATH.replace(REPO_ROOT_PATH, '').replace(/^(\/)/, '');
  printInfo(`relativePackagePathFromRepoRoot: ${relativePackagePathFromRepoRoot}`);
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
