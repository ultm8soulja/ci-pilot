import includes from 'lodash/includes';

import { printInfoText, printErrorText, startup } from '../../util';
import { isGitRepository, isWorkingDirectoryClean } from '../../modules';
import config from '../../config';

import { initRelease } from '.';

const { DEV_MODE } = config;

const steps = ['init'] as const;
export type Step = typeof steps[number];

export const release = async (step: Step) => {
  startup();

  printInfoText(`> ci-pilot release [step]`);
  if (!step) {
    printErrorText('No step chosen, exiting...');
    process.exit(1);
  } else if (!includes(steps, step)) {
    printErrorText(`Unrecognised step '${step}', exiting...`);
    process.exit(1);
  }

  printInfoText('Running preliminary checks...');

  if (!(await isGitRepository())) {
    printErrorText('This command must be run within a Git repository');
    process.exit(1);
  }

  if (!DEV_MODE && !(await isWorkingDirectoryClean())) {
    printErrorText('The Git working directory must be clean');
    process.exit(1);
  }

  try {
    switch (step) {
      case 'init':
        await initRelease();
        break;
    }
  } catch (error) {
    printErrorText(`${error.message}`);
    printErrorText('Exiting ...');
  }
};
