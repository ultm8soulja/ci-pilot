import { bumpVersion, publish } from '../modules/npm';
import { createTag, pushToOrigin, reset } from '../modules/git';
import config from '../config';

import { printInfo, isMonorepo } from './helpers';

export const publishPackage = async (packageName: string, nextVersion: string, nextTag: string) => {
  printInfo(`Finalising publish of ${packageName}, bumping to ${nextVersion} (tag: ${nextTag})`, packageName);

  printInfo('Set the version for the package, and tag HEAD with the same version', packageName);
  bumpVersion(nextVersion, false);
  await createTag(nextTag);

  printInfo('Publish package and push new tag to remote', packageName);
  const npmDistTag = isMonorepo() ? nextTag : `tag${config.tagSeparator}${nextTag}`;
  publish(npmDistTag);
  await pushToOrigin(nextTag);

  printInfo('Clean-up');
  await reset('hard');
};
