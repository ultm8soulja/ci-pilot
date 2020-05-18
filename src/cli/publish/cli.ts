import includes from 'lodash/includes';

import { printInfoText, printErrorText, isPackageManagerInstalled, startup, isMonorepo } from '../../util';
import { isGitRepository, isWorkingDirectoryClean } from '../../modules';
import config from '../../config';

import { publishFeature } from './';

const { packageManager, DEV_MODE, CWD, REPO_ROOT_PATH } = config;

const stages = ['feature', 'alpha'] as const;
export type Stage = typeof stages[number];

export const publish = async (stage: Stage) => {
  startup();
  printInfoText(`> ci-pilot publish [stage]`);

  if (!stage) {
    printErrorText('No stage chosen, exiting...');
    process.exit(1);
  } else if (!includes(stages, stage)) {
    printErrorText(`Unrecognised stage '${stage}', exiting...`);
    process.exit(1);
  }

  if (isMonorepo() && CWD !== REPO_ROOT_PATH) {
    printErrorText(
      `You're running the command from the directory of a package in a mono-repo workspace - if you'd like to solely publish this package then run the command with the --package-only flag, exiting...`
    );
    process.exit(1);
  }

  printInfoText('Running preliminary checks...');

  if (!(await isGitRepository())) {
    printErrorText('This tool must be run within a Git repository');
    process.exit(1);
  }

  if (!DEV_MODE && !(await isWorkingDirectoryClean())) {
    printErrorText('The Git working directory must be clean');
    process.exit(1);
  }

  if (!(await isPackageManagerInstalled())) {
    printErrorText(`The package manager '${packageManager}' is not installed, exiting...`);
    process.exit(1);
  }

  printInfoText(`Publishing stage '${stage}' ...`);

  try {
    switch (stage) {
      case 'feature':
        await publishFeature();
        break;
    }
  } catch (error) {
    printErrorText(`${error.message}`);
    printErrorText('Exiting ...');
  }
};
