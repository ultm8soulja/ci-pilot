import fs from 'fs';
import path from 'path';

import { get } from 'env-var';
import { config as dotEnvConfig } from 'dotenv';
import findRoot from 'find-root';

import { CIPilotFileConfig } from '../models';

import { validateAndProcessFileConfig } from './helpers';

/* Environment variables */

dotEnvConfig();

export const NPM_CONFIG_REGISTRY = get('NPM_CONFIG_REGISTRY')
  .default('http://localhost:4873')
  .asUrlString();

/* Constants */

export const PACKAGE_ROOT_PATH = findRoot(__dirname);
export const REPO_ROOT_PATH = findRoot(__dirname, dir => fs.existsSync(path.resolve(dir, '.git')));
export const PACKAGE_JSON_PATH = `${PACKAGE_ROOT_PATH}/package.json`;
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
export const FEATURE_BRANCH_REGEX = new RegExp(`^${feature}\/([A-Z]{2,}-[1-9]{1}[0-9]{0,})`);
export const SEMVER_FEATURE_PRERELEASE_ID_PREFIX = `alpha.${feature}.`;
export const SEMVER_ALPHA_PRERELEASE_ID_PREFIX = 'alpha.';
