// .eslintrc.js
// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@asherfoster/eslint-config/patch');

module.exports = {
  extends: [
    '@asherfoster'
  ],
  rules: {
    '@typescript-eslint/object-curly-spacing': 0,
    'object-curly-spacing': 0
  },
  parserOptions: {tsconfigRootDir: __dirname}
};
