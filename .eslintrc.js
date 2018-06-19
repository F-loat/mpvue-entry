module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    'node': true,
    'mocha': true,
  },
  rules: {
    'import/no-dynamic-require': 0,
    'global-require': 0,
    'consistent-return': 0,
    'no-confusing-arrow': 0
  },
};
