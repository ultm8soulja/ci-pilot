import includes from 'lodash/includes';

import { printInfoText, printErrorText, startup, isMonorepo } from '../../util';
import { isGitRepository, isWorkingDirectoryClean } from '../../modules';
import config from '../../config';

import { stageReleaseCandidateHead } from './stage';
import { finishRelease } from './finish';

import { initRelease } from '.';

const { DEV_MODE } = config;

const steps = ['init', 'stage', 'finish'] as const;
export type Step = typeof steps[number];

export const releaseGitHubGitFlow = async (step: Step) => {
  startup();

  printInfoText(`> ci-pilot release-gh-gf [step]`);
  if (!step) {
    printErrorText('No step chosen, exiting...');
    process.exit(1);
  } else if (!includes(steps, step)) {
    printErrorText(`Unrecognised step '${step}', exiting...`);
    process.exit(1);
  }

  printInfoText('Running preliminary checks...');

  if (await isMonorepo()) {
    printErrorText("This command doesn't presently support monorepos");
    process.exit(1);
  }

  // Check that master and develop exist
  // - if they are not already local, fetch them
  // - if they already exist locally ensure they have and upstream, otherwise exit (git ls-remote --heads origin master)

  // if (await gitflo()) {
  //   printErrorText("This command doesn't presently support monorepos");
  //   process.exit(1);
  // }

  if (!(await isGitRepository())) {
    printErrorText('This command must be run within a Git repository');
    process.exit(1);
  }

  if (!DEV_MODE && !(await isWorkingDirectoryClean())) {
    printErrorText('The Git working directory must be clean');
    process.exit(1);
  }

  printInfoText(`Release GitHub GitFlow: ${step} ...`);

  try {
    switch (step) {
      case 'init':
        await initRelease();
        break;
      case 'stage':
        await stageReleaseCandidateHead();
        break;
      case 'finish':
        await finishRelease();
        break;
    }
  } catch (error) {
    printErrorText(`${error.message}`);
    printErrorText('Exiting ...');
  }
};
