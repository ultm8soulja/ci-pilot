#!/usr/bin/env node

import minimist from 'minimist';
import {} from 'inquirer';

import { startup, printInfoText, printErrorText } from '../util';
import { isGitRepository, isWorkingDirectoryClean } from '../modules';

import { publish, Stage } from './publish';

(async (): Promise<void> => {
  startup();

  printInfoText('Running preliminary checks...');

  if (!(await isGitRepository())) {
    printErrorText('This tool must be run within a Git repository');
    process.exit(1);
  }

  if (!(await isWorkingDirectoryClean())) {
    printErrorText('The Git working directory must be clean');
    process.exit(1);
  }

  const {
    _: [command, subcommand],
  } = minimist(process.argv.slice(2));

  if (!command) {
    printErrorText('No command chosen, exiting...');
    process.exit(1);
  }

  switch (command) {
    case 'publish':
      publish(subcommand as Stage);
      break;
  }
})();
