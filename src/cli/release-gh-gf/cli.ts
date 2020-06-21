import includes from 'lodash/includes';

import { printInfoText, printErrorText, startup, isMonorepo, checkIsGitFlowRepository } from '../../util';
import { isGitRepository, isWorkingDirectoryClean } from '../../modules';
import config from '../../config';

import { stageReleaseCandidateHead } from './stage';
import { finishRelease } from './finish';
import { cutRelease } from './cut';
import { scrapRelease } from './scrap';

const { DEV_MODE } = config;

const steps = ['cut', 'stage', 'finish', 'scrap'] as const;
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
    checkIsGitFlowRepository();

    switch (step) {
      case 'cut':
        await cutRelease();
        break;
      case 'stage':
        await stageReleaseCandidateHead();
        break;
      case 'finish':
        await finishRelease();
        break;
      case 'scrap':
        await scrapRelease();
        break;
    }
  } catch (error) {
    printErrorText(`${error.message}`);
    printErrorText('Exiting ...');
    process.exit(1);
  }
};
