import {
  getPackageName,
  isMonorepo,
  printInfoText,
  buildPackageDependencyGraph,
  prepareNextFeatureVersion,
  finaliseVersion,
  printSuccess,
  getMonorepoPackages,
} from '../../util';
import { getCurrentBranchName } from '../../modules';
import config from '../../config';

const { PACKAGE_ROOT_PATH } = config;

export const versionFeature = async () => {
  const branchName = await getCurrentBranchName();

  if (isMonorepo()) {
    const packages = await getMonorepoPackages();

    const graph = buildPackageDependencyGraph(packages);
    // printSuccessText(JSON.stringify(graph.overallOrder()));
    // printSuccessText(JSON.stringify(graph.dependenciesOf('@fairfx/equals-server')));
  } else {
    const packagePath = PACKAGE_ROOT_PATH;

    const packageName = getPackageName(packagePath);

    printInfoText(`Package name is '${packageName}'`);

    const info = await prepareNextFeatureVersion(packagePath);

    if (!info) {
      process.exit(0);
    }

    await finaliseVersion(packagePath, info, false);

    const { version } = info;

    printSuccess(`Feature branch ${branchName} successfully version bumped`, packageName);
    printSuccess(`Version: ${version}`, packageName);
  }
};
