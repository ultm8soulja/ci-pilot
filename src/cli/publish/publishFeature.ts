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
    process.exit(0);
  }

  const { version, tag } = info;

  await finaliseVersionAndPublish(packagePath, info, false);

  printSuccess(`Feature branch ${branchName} successfully publish`, packageName);
  printSuccess(`Version: ${version}`, packageName);
  printSuccess(`Tag: ${tag}`, packageName);
};

export const publishFeature = async () => {
  const isMonorepo = isPackageAMonorepo();

  if (isMonorepo) {
    const packages = await getMonorepoPackages();

    for (const aPackage of packages) {
      publishAPackage(aPackage.absolutePath);
    }
  } else {
    await publishAPackage(PACKAGE_ROOT_PATH);
  }
};
