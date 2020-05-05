import includes from 'lodash/includes';

import { printInfoText, printErrorText } from '../util';
import { publishFeature } from '../publish';

const stages = ['feature', 'alpha'] as const;
export type Stage = typeof stages[number];

export const publish = async (stage: Stage) => {
  if (!stage) {
    printErrorText('No stage chosen, exiting ...');
    process.exit(1);
  } else if (!includes(stages, stage)) {
    printErrorText(`Unrecognised stage '${stage}', exiting ...`);
    process.exit(1);
  }

  printInfoText(`Publishing ${stage} ...`);

  try {
    switch (stage) {
      case 'feature':
        await publishFeature();
        break;
    }
  } catch (error) {
    printErrorText(`An error interrupted the operation: ${error.message}`);
    printErrorText('Exiting ...');
  }
};
