import includes from 'lodash/includes';

import { printErrorText, getPackageName, printSuccessText, checkIsGitFlowRepository } from '../../util';
import config from '../../config';

const { PACKAGE_JSON_FILE_PATH } = config;

const helpers = ['package-name', 'is-repo-gitflow'] as const;
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
      case 'is-repo-gitflow':
        try {
          checkIsGitFlowRepository();
          printSuccessText('Yes, this repository follows GitFlow');
        } catch (error) {
          printErrorText(error.message);
        }
        break;
    }
  } catch (error) {
    printErrorText(`${error.message}`);
  }
};
