<div align="center">
  <h1>CI Pilot 👨🏿‍✈️</h1>
  <p>Automate your CI pipeline with ease - you'll find binaries and functions that help you simplify the process</p>
</div>

<p align="center">
  <a href="#">
    <img src="https://img.shields.io/badge/GitHub%20Flow-Methodology-blue?style=flat&logo=github" style="max-width:100%;">
  </a>

  <a href="https://github.com/semantic-release/semantic-release#-semantic-release">
    <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" style="max-width:100%;">
  </a>
</p>

## Getting started

### Install

npm
```bash
npm i --save-dev ci-pilot
```

Yarn
```bash
yarn add -D ci-pilot
```

### Usage

#### Features

Publish npm packages on features you're developing by adding the following as a step in your CI pipeline:
```bash
$ ci-pilot publish feature
```

### Configure

- `gitMethodology`: Mandatory, **GitFlow** or **GitHubFlow**
- `branchNames.base`: Optional, defaults to **master**
- `branchNames.feature`: Optional, defaults to **feature**
- `branchNames.hotfix`: Optional, defaults to **hotfix**
- `branchNames.development`: Optional, defaults to **develop**
- `branchNames.bugfix`: Optional, defaults to **bugfix**
- `gitBranchSeparator`: Options: **/** | **-**, defaults to **/**
- `tagSeparator`: Options: **#** | **£** | **$**, defaults to **#**

Default (fully expanded):
```json
{
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
