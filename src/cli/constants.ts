export const HELP_MSG = `
Usage: ci-pilot [OPTIONS] [COMMAND]

Automate your CI pipeline with ease

Commands:
  publish
  release-gh-gf
  helper

Options for release-gh-gf:
  -v  --version                 Displays the version of this CLI then exits
      --debug                   Starts the CLI in debug mode, with extra verbosity and leniency

Run 'ci-pilot COMMAND --help' for more information on a command.
`;

export const RELEASE_GH_GF_HELP_MSG = `
Usage: ci-pilot release-gh-gf [OPTIONS] [COMMAND]

Orchestrate your GitFlow release strategy while still getting the best out of GitHub as your release manager

Sub-Commands:
  cut
  stage
  scrap
  finish

Options:
  -a  --auto-bump-change-log    This flag when specified will use standard-version under the hood to generate the
                                next release version based on the Conventional Commits preset chosen, bump the
                                package.json version, generate or update the change log, and Git tag the commit
                                with the version
  -m  --merge-msg-skip-ci       This flag will suffix GitFlow merge commits with [skip ci], a common convention
                                used to avoid additional jobs being triggered in your CI pipeline
`;
