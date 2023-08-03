/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended-type-checked', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': 'off',
  },
};
