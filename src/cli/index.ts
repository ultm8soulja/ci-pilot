#!/usr/bin/env node

import minimist from 'minimist';

import { printErrorText } from '../util';

import { publish, Stage as PublishStage } from './publish';
import { helper, Helper } from './helper';
// import { version, Stage as VersionStage } from './version';
import { releaseGitHubGitFlow, Step as ReleaseStep } from './releaseGitHubGitFlow';

(async (): Promise<void> => {
  const {
    _: [command, subcommand],
  } = minimist(process.argv.slice(2));

  if (!command) {
    printErrorText('No command chosen, exiting...');
    process.exit(1);
  }

  switch (command) {
    case 'publish':
      publish(subcommand as PublishStage);
      break;
    case 'helper':
      helper(subcommand as Helper);
      break;
    // case 'version':
    //   version(subcommand as VersionStage);
    //   break;
    case 'release-gh-gf':
      releaseGitHubGitFlow(subcommand as ReleaseStep);
      break;
    default:
      printErrorText('Unrecognised command, exiting...');
      process.exit(1);
  }
})();
