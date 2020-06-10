import includes from 'lodash/includes';

import { printErrorText, getPackageName, printSuccessText } from '../../util';
import config from '../../config';

const { PACKAGE_JSON_FILE_PATH } = config;

const helpers = ['package-name'] as const;
export type Helper = typeof helpers[number];

export const helper = async (helper: Helper) => {
  if (!helper) {
    printErrorText('No helper chosen, exiting...');
    process.exit(1);
  } else if (!includes(helpers, helper)) {
    printErrorText(`Unrecognised helper '${helper}', exiting...`);
    process.exit(1);
  }

  try {
    switch (helper) {
      case 'package-name':
        printSuccessText(getPackageName(PACKAGE_JSON_FILE_PATH), false);
        break;
    }
  } catch (error) {
    printErrorText(`${error.message}`);
  }
};
