module.exports = {
  hooks: {
    'pre-commit': 'yarn lint && yarn format && yarn compile:dry',
    'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS',
    'pre-push': 'yarn test',
  },
};
