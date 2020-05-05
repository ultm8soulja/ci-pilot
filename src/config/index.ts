import {
  fileConfig,
  CI_PILOT_CONFIG_PATH,
  FEATURE_BRANCH_REGEX,
  LERNA_CONFIG_PATH,
  NPM_CONFIG_REGISTRY,
  PACKAGE_JSON_PATH,
  PACKAGE_ROOT_PATH,
  REPO_ROOT_PATH,
  SEMVER_ALPHA_PRERELEASE_ID_PREFIX,
  SEMVER_FEATURE_PRERELEASE_ID_PREFIX,
} from './config';
import { defaultBranches } from './helpers';

const out = {
  NPM_CONFIG_REGISTRY,

  PACKAGE_ROOT_PATH,
  REPO_ROOT_PATH,
  PACKAGE_JSON_PATH,
  LERNA_CONFIG_PATH,
  CI_PILOT_CONFIG_PATH,
  FEATURE_BRANCH_REGEX,
  SEMVER_FEATURE_PRERELEASE_ID_PREFIX,
  SEMVER_ALPHA_PRERELEASE_ID_PREFIX,

  ...fileConfig,

  defaultBranches,
};

export default out;
