import fs from 'fs';
import path from 'path';

import { get } from 'env-var';
import { config as dotEnvConfig } from 'dotenv';
import findRoot from 'find-root';

import { CIPilotFileConfig } from '../models';
import { printErrorText, printInfoText } from '../util/console';

import { validateAndProcessFileConfig, defaultBranches } from './helpers';

/* Environment variables */

dotEnvConfig();

const NPM_CONFIG_REGISTRY = get('NPM_CONFIG_REGISTRY').asUrlString();

const DRY_RUN = get('DRY_RUN')
  .default('false')
  .asBoolStrict();

const DEV_MODE = get('DEV_MODE')
  .default('false')
  .asBoolStrict();

/* Constants */

const PACKAGE_JSON_FILE = 'package.json';
const ciPilotPackageName = 'ci-pilot';
const ciPilotConfigFile = 'ci-pilot.config.json';
const nodeModulesInPathPattern = /\/node_modules/;
const CWD = process.cwd();

const PACKAGE_ROOT_PATH = findRoot(CWD, dir => {
  if (fs.existsSync(`${dir}/${PACKAGE_JSON_FILE}`)) {
    const packageName = JSON.parse(fs.readFileSync(`${dir}/${PACKAGE_JSON_FILE}`, { encoding: 'utf-8' })).name;
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

const REPO_ROOT_PATH = findRoot(CWD, dir => fs.existsSync(path.resolve(dir, '.git')));
const ROOT_PACKAGE_JSON_FILE_PATH = `${REPO_ROOT_PATH}/${PACKAGE_JSON_FILE}`;
const PACKAGE_JSON_FILE_PATH = `${PACKAGE_ROOT_PATH}/${PACKAGE_JSON_FILE}`;
const LERNA_CONFIG_FILE_PATH = `${REPO_ROOT_PATH}/lerna.json`;
const CI_PILOT_CONFIG_FILE_PATH = `${REPO_ROOT_PATH}/${ciPilotConfigFile}`;

/* File */

// TODO: Support other config file formats other than JSON
let rawFileConfig: string;
try {
  rawFileConfig = fs.readFileSync(CI_PILOT_CONFIG_FILE_PATH, { encoding: 'utf-8' });
} catch (error) {
  printErrorText(`You need to create a ${ciPilotConfigFile} in the root of your repository.`);
  process.exit(1);
}
const fileConfig: CIPilotFileConfig = JSON.parse(rawFileConfig);

validateAndProcessFileConfig(fileConfig);

/* Other constants */

const {
  branchNames: { feature },
} = fileConfig;
const FEATURE_BRANCH_REGEX = new RegExp(`^${feature}\/([A-Za-z]{2,}-[1-9]{1}[0-9]{0,})`);
const SEMVER_FEATURE_PRERELEASE_ID_PREFIX = `alpha.${feature}.`;
const SEMVER_ALPHA_PRERELEASE_ID_PREFIX = 'alpha.';

const out = {
  NPM_CONFIG_REGISTRY,

  PACKAGE_ROOT_PATH,
  REPO_ROOT_PATH,
  ROOT_PACKAGE_JSON_FILE_PATH,
  PACKAGE_JSON_FILE_PATH,
  LERNA_CONFIG_FILE_PATH,
  CI_PILOT_CONFIG_FILE_PATH,
  FEATURE_BRANCH_REGEX,
  SEMVER_FEATURE_PRERELEASE_ID_PREFIX,
  SEMVER_ALPHA_PRERELEASE_ID_PREFIX,
  DEV_MODE,
  DRY_RUN,
  PACKAGE_JSON_FILE,
  CWD,

  ...fileConfig,

  defaultBranches,
};

export default out;

if (DEV_MODE) {
  printInfoText(JSON.stringify(out, undefined, 2));
}
