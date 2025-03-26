/* eslint-env node */
// require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:import/recommended',
    // 'airbnb-base',
    // 'airbnb-typescript/base',
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.app.json'],
    ecmaVersion: 'latest',
    parser: "@typescript-eslint/parser"
  },
  settings: {
    'import/resolver': {
       alias: {
         map: [
          ['@', './src']
        ],
        extensions: ['.ts', '.js', '.vue']
      }
    }
  },
  ignorePatterns: ['.eslintrc.cjs', 'vite.config.ts', 'public/*', './js/phoenix/*.js', './src/utils/petite-vue.es.js'],
  rules: {
    "semi": ["off"],
    "@typescript-eslint/semi": ["off"],
    "comma-dangle": "off",
    "@typescript-eslint/comma-dangle": "off",
    'max-len': [2, { code: 120 }],
    'no-restricted-syntax': 0,
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'vue/multi-word-component-names': 'off',
    'function-paren-newline': 0,
    'no-alert': 'off',
    'no-plusplus': ["error", { "allowForLoopAfterthoughts": true }],
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    // 'no-unused-vars': ['error', { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', ignoreRestSiblings: true }],
    'no-unused-vars': "off",
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/extensions': 'off',
    'no-prototype-builtins': 'off',
    // 'import/extensions': [
    //   'error',
    //   'ignorePackages',
    //   {
    //     js: 'never',
    //     jsx: 'never',
    //     ts: 'never',
    //     tsx: 'never',
    //   },
    // ],
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: [
          'state',
          'acc',
          'e',
          'ctx',
          'req',
          'request',
          'res',
          'response',
          '$scope',
        ],
      },
    ],
  },
};
