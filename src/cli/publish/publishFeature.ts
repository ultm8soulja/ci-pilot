import {
  getPackageName,
  printSuccess,
  printInfoText,
  prepareNextFeatureVersion,
  finaliseVersionAndPublish,
  isMonorepo as isPackageAMonorepo,
  getMonorepoPackages,
} from '../../util';
import { getCurrentBranchName } from '../../modules';
import config from '../../config';

const { PACKAGE_ROOT_PATH } = config;

const publishAPackage = async (packagePath: string) => {
  const packageName = getPackageName(packagePath);
  const branchName = await getCurrentBranchName();
  printInfoText(`Package name is '${packageName}'`);

  const info = await prepareNextFeatureVersion(packagePath);

  if (!info) {
    return;
  }

  const { version, tag } = info;

  await finaliseVersionAndPublish(packagePath, info, false);

  printSuccess(`Feature branch ${branchName} successfully publish`, packageName, false);
  printSuccess(`Version: ${version}`, packageName, false);
  printSuccess(`Tag: ${tag}`, packageName, false);
};

export const publishFeature = async () => {
  const isMonorepo = isPackageAMonorepo();

  if (isMonorepo) {
    printInfoText(`This is a mono-repo - all workspace packages will be published`);
    const packages = await getMonorepoPackages();

    for (const aPackage of packages) {
      await publishAPackage(aPackage.packagePath);
    }
  } else {
    await publishAPackage(PACKAGE_ROOT_PATH);
  }
};
