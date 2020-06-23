import includes from 'lodash/includes';

import {
  CIPilotFileConfig,
  BranchNames,
  tagSeparators,
  gitBranchSeparators,
  gitMethodologies,
  packageManagers,
  Release,
} from '../models';

export const defaultBranches: BranchNames = {
  base: 'master',
  bugfix: 'bugfix',
  development: 'develop',
  feature: 'feature',
  hotfix: 'hotfix',
  release: 'release',
};

export const defaultRelease: Release = {
  preset: 'angular',
  tagPrefix: 'v',
};

export const validateAndProcessFileConfig = (config: CIPilotFileConfig) => {
  if (!config.branchNames) {
    config.branchNames = defaultBranches;
  } else {
    config.branchNames = Object.assign(defaultBranches, config.branchNames);
  }

  if (!config.release) {
    config.release = defaultRelease;
  } else {
    config.release = Object.assign(defaultRelease, config.release);
  }

  if (!config.gitMethodology) {
    throw new Error('You must choose a Git methodology in the config file (GitFlow or GitHubFlow)');
  } else if (!includes(gitMethodologies, config.gitMethodology)) {
    throw new Error(`'${config.gitMethodology}' is not an allowed Git methodology`);
  }

  if (!config.tagSeparator) {
    config.tagSeparator = '#';
  } else if (!includes(tagSeparators, config.tagSeparator)) {
    throw new Error(`'${config.tagSeparator}' is not an allowed tag separator`);
  }

  if (!config.gitBranchSeparator) {
    config.gitBranchSeparator = '/';
  } else if (!includes(gitBranchSeparators, config.gitBranchSeparator)) {
    throw new Error(`'${config.gitBranchSeparator}' is not an allowed branch separator`);
  }

  if (!config.packageManager) {
    config.packageManager = 'npm';
  } else if (!includes(packageManagers, config.packageManager)) {
    throw new Error(`'${config.packageManager}' is not an allowed package manager`);
  }
};
