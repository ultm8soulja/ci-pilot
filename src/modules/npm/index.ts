import { exec } from 'shelljs';

import { checkState } from '../../util/helpers';
import config from '../../config';

export const bumpVersion = (version: string, gitTagVersion = true) => {
  const output = exec(`npm version ${version}${gitTagVersion ? '' : ' --no-git-tag-version'}`, { silent: true });

  checkState(output);
};

export const publish = (distTag = 'latest') => {
  const output = exec(`npm publish --tag ${distTag} --registry ${config.NPM_CONFIG_REGISTRY}`, { silent: true });

  checkState(output);
};

export const isNpmInstalled = () => {
  const { code } = exec('npm -v', { silent: true });

  return code === 0;
};
