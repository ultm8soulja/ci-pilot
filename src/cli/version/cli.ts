import includes from 'lodash/includes';

import { printInfoText, printErrorText, startup } from '../../util';
import { isGitRepository, isWorkingDirectoryClean } from '../../modules';
import config from '../../config';

import { versionFeature } from './';

const { DEV_MODE } = config;

const stages = ['feature'] as const;
export type Stage = typeof stages[number];

export const version = async (stage: Stage) => {
  startup();

  printInfoText(`> ci-pilot version [stage]`);
  if (!stage) {
    printErrorText('No stage chosen, exiting...');
    process.exit(1);
  } else if (!includes(stages, stage)) {
    printErrorText(`Unrecognised stage '${stage}', exiting...`);
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

  printInfoText(`Versioning a ${stage} ...`);

  try {
    switch (stage) {
      case 'feature':
        await versionFeature();
        break;
    }
  } catch (error) {
    printErrorText(`${error.message}`);
    printErrorText('Exiting ...');
  }
};
