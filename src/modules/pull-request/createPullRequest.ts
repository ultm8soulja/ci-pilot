import { readFileSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import github from 'gh-got';

import { getRepositoryName } from '../git';
import config from '../../config';
import { printInfoText, printErrorText, printSuccessText } from '../../util';

const { GITHUB_TOKEN, RELEASE_REQUEST_PATH } = config;

const parseReleaseRequest = async () => {
  try {
    const file = readFileSync(RELEASE_REQUEST_PATH, { encoding: 'utf-8' });
    return file;
  } catch (err) {
    printInfoText('No RELEASE_REQUEST.md was found, your release request will be opened with an empty description');
    return '';
  }
};

export const createPullRequest = async (headBranch: string, baseBranch: string, newVersion: string) => {
  const remote = await getRepositoryName();

  if (!GITHUB_TOKEN) {
    printErrorText('GITHUB_TOKEN is required to create a pull request');
    process.exit(1);
  }

  printInfoText(`Attempting to open release request in ${remote}`);

  const body = await parseReleaseRequest();

  try {
    // GitHub documentation: https://developer.github.com/v3/pulls/#create-a-pull-request
    await github.post(`repos/${remote}/pulls`, {
      token: GITHUB_TOKEN,
      body: {
        title: `chore(release): => v${newVersion}`,
        head: headBranch,
        base: baseBranch,
        body: `${body} \n\n\n*Created by [ci-pilot](https://github.com/ultm8soulja/ci-pilot)*`,
        draft: true,
        labels: ['release'],
      },
    });
  } catch (err) {
    printErrorText('Failed to create pull request in repository');
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

  printSuccessText('Release pull request opened');
};
