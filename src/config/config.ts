import fs from 'fs';
import path from 'path';

import { get } from 'env-var';
import { config as dotEnvConfig } from 'dotenv';
import findRoot from 'find-root';

import { CIPilotFileConfig } from '../models';

import { validateAndProcessFileConfig } from './helpers';

/* Environment variables */

dotEnvConfig();

export const NPM_CONFIG_REGISTRY = get('NPM_CONFIG_REGISTRY').asUrlString();

export const DEV_MODE = get('DEV_MODE')
  .default('false')
  .asBoolStrict();

/* Constants */

const packageJsonFile = 'package.json';
const ciPilotPackageName = 'ci-pilot';
const nodeModulesInPathPattern = /\/node_modules/;
const cwd = process.cwd();

export const PACKAGE_ROOT_PATH = findRoot(cwd, dir => {
  if (fs.existsSync(`${dir}/${packageJsonFile}`)) {
    const packageName = JSON.parse(fs.readFileSync(`${dir}/${packageJsonFile}`, { encoding: 'utf-8' })).name;
    if (packageName === ciPilotPackageName && nodeModulesInPathPattern.test(dir) === false) {
      // Running within ci-pilot Git repository
      return true;
    } else if (packageName !== ciPilotPackageName) {
      // Running in another with ci-pilot installed as a dependency (within node_modules)
      return true;
    }
  }

  return false;
});

export const REPO_ROOT_PATH = findRoot(cwd, dir => fs.existsSync(path.resolve(dir, '.git')));
export const PACKAGE_JSON_PATH = `${PACKAGE_ROOT_PATH}/${packageJsonFile}`;
export const LERNA_CONFIG_PATH = `${REPO_ROOT_PATH}/lerna.json`;
export const CI_PILOT_CONFIG_PATH = `${REPO_ROOT_PATH}/ci-pilot.config.json`;

/* File */

// TODO: Support other config file formats other than JSON
// TODO: Validate config using JSON Schema
export const fileConfig: CIPilotFileConfig = JSON.parse(fs.readFileSync(CI_PILOT_CONFIG_PATH, { encoding: 'utf-8' }));

validateAndProcessFileConfig(fileConfig);

/* Other constants */

const {
  branchNames: { feature },
} = fileConfig;
export const FEATURE_BRANCH_REGEX = new RegExp(`^${feature}\/([A-Za-z]{2,}-[1-9]{1}[0-9]{0,})`);
export const SEMVER_FEATURE_PRERELEASE_ID_PREFIX = `alpha.${feature}.`;
export const SEMVER_ALPHA_PRERELEASE_ID_PREFIX = 'alpha.';
