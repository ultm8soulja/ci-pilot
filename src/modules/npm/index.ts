import { exec } from 'shelljs';

import { checkState } from '../../util/helpers';
import config from '../../config';

export const bumpVersion = (packagePath: string, version: string, gitTagVersion = true) => {
  const output = exec(`npm version ${version}${gitTagVersion ? '' : ' --no-git-tag-version'}`, {
    silent: true,
    cwd: packagePath,
  });

  checkState(output);
};

export const publish = (packagePath: string, distTag = 'latest') => {
  const output = exec(`npm publish --tag ${distTag} --registry ${config.NPM_CONFIG_REGISTRY}`, {
    silent: true,
    cwd: packagePath,
  });

  checkState(output);
};

export const isNpmInstalled = () => {
  const { code } = exec('npm -v', { silent: true });

  return code === 0;
};
