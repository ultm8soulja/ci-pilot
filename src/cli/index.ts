#!/usr/bin/env node

import minimist from 'minimist';

import { printErrorText, printStandardText } from '../util';

import { publish, Stage as PublishStage } from './publish';
import { helper, Helper } from './helper';
// import { version, Stage as VersionStage } from './version';
import { releaseGitHubGitFlow, Step as ReleaseStep } from './release-gh-gf';
import { HELP_MSG } from './constants';

(async (): Promise<void> => {
  const cliArgs = minimist(process.argv.slice(2));
  const {
    _: [command, subcommand],
  } = cliArgs;

  if (!command) {
    if (cliArgs.help) {
      printStandardText(HELP_MSG, false);
      process.exit(0);
    } else {
      printErrorText('No command chosen, exiting...');
      process.exit(1);
    }
  }

  switch (command) {
    case 'publish':
      publish(subcommand as PublishStage, cliArgs);
      break;
    case 'helper':
      helper(subcommand as Helper);
      break;
    // case 'version':
    //   version(subcommand as VersionStage);
    //   break;
    case 'release-gh-gf':
      releaseGitHubGitFlow(subcommand as ReleaseStep, cliArgs);
      break;
    default:
      printErrorText('Unrecognised command, exiting...');
      process.exit(1);
  }
})();
