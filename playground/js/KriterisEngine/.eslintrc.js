module.exports = {
  extends: 'erb',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'no-extend-native': 'off',
    semi: [2, 'never'],
    'no-debugger': 'off',
    'spaced-comment': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    'no-return-assign': 'off',
    'no-plusplus': 'off',
    'no-eval': 'off',
    'import/prefer-default-export': 'off',
    'no-param-reassign': 'off',
    'no-useless-computed-key': 'off',
    'object-shorthand': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.js'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
}
