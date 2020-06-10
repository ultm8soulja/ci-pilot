import {
  getPackageName,
  printSuccess,
  printInfoText,
  prepareNextFeatureVersion,
  finaliseVersionAndPublish,
  isMonorepo,
  getMonorepoPackages,
  buildPackageDependencyGraph,
} from '../../util';
import { getCurrentBranchName } from '../../modules';
import config from '../../config';
import { NextVersionInfo, PackageJson } from '../../models';

const { PACKAGE_ROOT_PATH } = config;

const publishMonorepoStepOne = async (packagePath: string) => {
  const packageName = getPackageName(packagePath);
  printInfoText(`Package name is '${packageName}'`);
  return await prepareNextFeatureVersion(packagePath);
};

const publishMonorepoStepTwo = async (packagePath: string, versionInfo: NextVersionInfo) => {
  const packageName = getPackageName(packagePath);
  const branchName = await getCurrentBranchName();

  const { version, tag } = versionInfo;

  const done = await finaliseVersionAndPublish(packagePath, versionInfo, false);

  if (done) {
    printSuccess(`Feature branch ${branchName} successfully publish`, packageName, false);
    printSuccess(`Version: ${version}`, packageName, false);
    printSuccess(`Tag: ${tag}`, packageName, false);
  }
};

const publishAPackage = async (packagePath: string) => {
  const info = await publishMonorepoStepOne(packagePath);

  if (info) {
    await publishMonorepoStepTwo(packagePath, info);
  }
};

export const publishFeature = async () => {
  if (isMonorepo()) {
    printInfoText(`This is a mono-repo - all workspace packages will be published`);
    const packages = await getMonorepoPackages();
    const packagesInfo = new Map<string, NextVersionInfo>();

    const changedPackages: PackageJson[] = [];

    for (const aPackage of packages) {
      const stepOneOutcome = await publishMonorepoStepOne(aPackage.packagePath);
      if (stepOneOutcome) {
        changedPackages.push(aPackage);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        packagesInfo.set(aPackage.name!, stepOneOutcome);
      }
    }

    /**
     * For changes packages:
     * 1. Get inter-dependency order for all mono-repo packages
     * 2. Identify
     */

    // const graph = buildPackageDependencyGraph(packages);

    for (const aPackage of changedPackages) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const info = packagesInfo.get(aPackage.name!);

      if (info) {
        await publishMonorepoStepTwo(aPackage.packagePath, info);
      }
    }
  } else {
    await publishAPackage(PACKAGE_ROOT_PATH);
  }
};
