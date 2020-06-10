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

1. `ci-pilot publish feature`
1. `ci-pilot release init`

## Ethos

We have different recommendations on how to use CI Pilot based on the progress of the code change through your software release pipeline - see details below.

### Developing features

#### Publish your package

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
- `gitBranchSeparator`: Options: **/** | **-**, defaults to **/**
- `tagSeparator`: Options: **#** | **£** | **$**, defaults to **#**

_Note: CI Pilot uses your package manager of choice under the hood, npm or yarn. Ensuring that your CI pipeline is configured correctly for npm or yarn remains your responsibility and is out of scope for CI Pilot._ 