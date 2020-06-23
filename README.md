<div align="center">
  <h1>CI Pilot 👨🏿‍✈️</h1>
  <p>Automate your CI pipeline with ease - you'll find binaries and functions that help you simplify the process.</p>
</div>

<p align="center">
  <a href="#">
    <img src="https://img.shields.io/badge/GitHub%20Flow-Methodology-blue?style=flat&logo=github" style="max-width:100%;">
  </a>

  <a href="https://github.com/semantic-release/semantic-release#-semantic-release">
    <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" style="max-width:100%;">
  </a>
  
  <a href="https://circleci.com/gh/ultm8soulja/ci-pilot">
    <img src="https://circleci.com/gh/ultm8soulja/ci-pilot.svg?style=svg&circle-token=f8aa6102f5e3d526e5f2d0ae15b2a8cf7afc3e53" style="max-width:100%;">
  </a>

  <a href="#contributors-">
    <img src="https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square" style="max-width:100%;">
  </a>

  <a href="https://www.npmjs.com/package/ci-pilot">
    <img src="https://img.shields.io/npm/v/ci-pilot.svg" style="max-width:100%;">
  </a>

  <a href="https://conventionalcommits.org">
    <img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" style="max-width:100%;">
  </a>
</p>

## Overview

CI Pilot aims to provide direction and guidance towards setting up the ideal software delivery pipeline as well as fully automating it.

### Production releases
There are plenty of incredible players on the market that aid in production release management and publishing, and CI Pilot doesn't aim to compete with them, rather to bridge the gap and standardise their use in coordination with your Git methodology (focusing on GitHubFlow and GitFlow).

### Pre-production releases
Looking at the most well used release management tools (semantic-release, standard-version, etc.), there's a clear lack of in-depth focus on how to go about producing internal packages during the development life-cycle, pre-production. CI Pilot steps in with out of the box support for the following:

1. Feature/Bug-Fix/Hot-Fix branch alpha releases, Git tagging the branch and publishing a package
1. For GitFlow adopters, Alpha releases, Git tagging the development branch and publishing a package

## Getting started

### Install

npm:
```bash
npm i --save-dev ci-pilot
```

Yarn:
```bash
yarn add -D ci-pilot
```

## Commands

Supported commands:
1. `publish`
1. `release-gh-gf`
1. `helpers`

### Publish
`ci-pilot publish [stage]`

#### Publish a feature branch
```bash
ci-pilot publish feature
```

### Release GitHub-GitFlow
`ci-pilot release-gh-fg [step]`

#### Cut a new release
```bash
ci-pilot release-gh-gf cut
```

#### Stage a release via a Git tag
```bash
ci-pilot release-gh-gf stage
```

#### Finish a release
```bash
ci-pilot release-gh-gf finish
```

Additional command-line flags:
- `--auto-bump-change-log` or `-a`: This flag when specified will use [standard-version](https://github.com/conventional-changelog/standard-version) under the hood to generate the next release version based on the Conventional Commits preset chosen, bump the `package.json` version, generate or update the change log, and Git tag the commit with the version.
- `--merge-msg-skip-ci` or `-m`: This flag will suffix GitFlow merge commits with `[skip ci]`, a common convention used to avoid additional jobs being triggered in your CI pipeline.

#### Scrap a release
```bash
ci-pilot release-gh-gf scrap
```

### Helpers
`ci-pilot helpers [helper]`

#### Cut a new release
```bash
ci-pilot helpers package-name
```

#### Stage a release via a Git tag
```bash
ci-pilot helpers is-repo-gitflow
```

## Configure

Create a file called `ci-pilot.config.json` in the root of the repository, and populate it with the following:

Default (fully expanded):
```json
{
  "packageManager": "npm",
  "gitMethodology": "...",
  "branchNames": {
    "base": "master",
    "feature": "feature",
    "hotfix": "hotfix",
    "development": "develop",
    "bugfix": "bugfix"
  },
  "release": {
    "preset": "angular",
    "tagPrefix": "v"
  },
  "gitBranchSeparator": "/",
  "tagSeparator": "#"
}
```

Alternate example:
```json
{
  "gitMethodology": "...",
  "branchNames": {
    "base": "main",
    "feature": "topic",
  "gitBranchSeparator": "-",
  "tagSeparator": "$"
}
```

Configuration Options:
- `packageManager`: Options, **npm** or **yarn**, defaults to **npm**
- `gitMethodology`: Mandatory, **GitFlow** or **GitHubFlow**
- `branchNames.base`: Optional, defaults to **master**
- `branchNames.feature`: Optional, defaults to **feature**
- `branchNames.hotfix`: Optional, defaults to **hotfix**
- `branchNames.development`: Optional, defaults to **develop**
- `branchNames.bugfix`: Optional, defaults to **bugfix**
- `release.preset`: Optional, defaults to **angular**
- `release.tagPrefix`: Optional, defaults to **v**
- `gitBranchSeparator`: Options: **/** | **-**, defaults to **/**
- `tagSeparator`: Options: **#** | **£** | **$**, defaults to **#**

_Note: CI Pilot uses your package manager of choice under the hood, npm or yarn. Ensuring that your CI pipeline is configured correctly for npm or yarn remains your responsibility and is out of scope for CI Pilot._ 

## Ethos

We have different recommendations on how to use CI Pilot based on the progress of the code change through your software release pipeline - see details below.

### Developing features

#### Publish your feature package

Publish packages on features you're developing by adding the following command as a step in your CI pipeline:
```bash
ci-pilot publish feature
```

Note: We don't recommend committing feature branch versions bumps to Git, as the pre-release alpha versions would eventually be merged into base or development branches which is wrong. Instead we believe that Git tags are sufficient to mark the origin of built packages that are uploaded to your package registries.

Our strategy:
1. Version the package(s) in the repository locally
1. Publish the packages (containing the `package.json` file for built assets contain the alpha feature version)
1. Wipe away the version changes in the Git working tree

If you're working in a mono-repo then the above command will detect that and by default publish all workspace packages. If you wish to only publish only one of the packages in the mono-repo then you should include the `--package-only` flag otherwise the command will fail, as it's not our recommendation.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/ultm8soulja"><img src="https://avatars1.githubusercontent.com/u/4200010?v=4" width="100px;" alt=""/><br /><sub><b>Colin Agbabiaka</b></sub></a><br /><a href="#ideas-ultm8soulja" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-ultm8soulja" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/ultm8soulja/ci-pilot/commits?author=ultm8soulja" title="Code">💻</a></td>
    <td align="center"><a href="https://halvorson.co.uk"><img src="https://avatars1.githubusercontent.com/u/10282220?v=4" width="100px;" alt=""/><br /><sub><b>Jamie Halvorson</b></sub></a><br /><a href="#ideas-jhalvorson" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ultm8soulja/ci-pilot/commits?author=jhalvorson" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License
[MIT](https://github.com/ultm8soulja/ci-pilot/blob/master/LICENSE)
