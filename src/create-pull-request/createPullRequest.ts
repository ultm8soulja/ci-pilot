import { readFileSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import github from 'gh-got';

import { getCurrentBranchName, getRepositoryName } from '../modules/git';
import { GH_TOKEN, RELEASE_REQUEST_PATH } from '../config/config';
import { printInfoText, printErrorText, printSuccessText, printError } from '../util';

const parseReleaseRequest = async () => {
  try {
    const file = readFileSync(RELEASE_REQUEST_PATH, { encoding: 'utf-8' });
    return file;
  } catch (err) {
    printErrorText('either there is no RELEASE_REQUEST.md file present or it is invalid');
    return '';
  }
};

export const createPullRequest = async () => {
  const currentBranch = await getCurrentBranchName();
  const remote = await getRepositoryName();
  const newVersion = '2.0.0'; // to be updated
  const baseBranch = 'master'; // to be updated

  printInfoText(`attempting to open release request in ${remote}`);

  const body = await parseReleaseRequest();

  try {
    await github.post(`repos/${remote}/pulls`, {
      token: GH_TOKEN,
      body: {
        title: `chore(release): v${newVersion}`,
        head: currentBranch,
        base: baseBranch,
        body: `${body} \n\n\n*created by ci-pilot*`,
      },
    });
  } catch (err) {
    printErrorText('failed to create pull request in repository');
    // gh-got provides helpful error messages, however, we have to dig
    // a little bit to get them.
    const prettyError = err?.response?.body?.errors?.[0];
    if (prettyError) {
      printErrorText(prettyError.message);
    } else {
      printError(err);
    }

    return;
  }

  printSuccessText('release request opened');
};
