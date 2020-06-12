import { readFileSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import github from 'gh-got';

import { getCurrentBranchName, getRepositoryName } from '../git';
import config, { GH_TOKEN } from '../../config';
import { printInfoText, printErrorText, printSuccessText } from '../../util';

const parseReleaseRequest = async () => {
  try {
    const file = readFileSync(config.RELEASE_REQUEST_PATH, { encoding: 'utf-8' });
    return file;
  } catch (err) {
    printInfoText('no RELEASE_REQUEST.md was found, your release request will be opened with an empty description');
    return '';
  }
};

export const createPullRequest = async (rcBranch: string, newVersion: string) => {
  const currentBranch = await getCurrentBranchName();
  const remote = await getRepositoryName();

  if (!GH_TOKEN) {
    printErrorText('GH_TOKEN is required to create a pull request');
    process.exit(1);
  }

  printInfoText(`attempting to open release request in ${remote}`);

  const body = await parseReleaseRequest();

  try {
    // GitHub documentation: https://developer.github.com/v3/pulls/#create-a-pull-request
    await github.post(`repos/${remote}/pulls`, {
      token: GH_TOKEN,
      body: {
        title: `chore(release): v${newVersion}`,
        head: currentBranch,
        base: rcBranch,
        body: `${body} \n\n\n*created by ci-pilot*`,
        draft: true,
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
      printErrorText(err);
    }

    return;
  }

  printSuccessText('release request opened');
};
