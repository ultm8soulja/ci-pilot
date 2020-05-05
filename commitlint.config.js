module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['release', 'scripts']],
    'subject-case': [2, 'always', ['sentence-case', 'lower-case']],
  },
};
