import { getPackageName, publishPackage, printSuccess, printInfoText, prepareNextFeatureVersion } from '../../util';
import { getCurrentBranchName } from '../../modules';

export const versionAndPublishFeature = async (packagePath: string) => {
  const packageName = getPackageName(packagePath);
  const branchName = await getCurrentBranchName();

  printInfoText(`Package name is '${packageName}'`);

  const info = await prepareNextFeatureVersion(packagePath);

  if (!info) {
    process.exit(0);
  }

  const { tag } = info;

  // TODO:

  await publishPackage(packagePath, tag);

  printSuccess(`Feature branch ${branchName} successfully publish`, packageName);
  printSuccess(`Tag: ${tag}`, packageName);
};
