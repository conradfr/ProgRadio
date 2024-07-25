/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  "root": true,
  "extends": [
    "plugin:vue/vue3-essential",
    // 'plugin:vue/vue3-strongly-recommended',
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",
    // "@vue/eslint-config-prettier"
    'airbnb-base',
    'plugin:import/typescript',
  ],
  "env": {
    "vue/setup-compiler-macros": true
  },
  rules: {
    "comma-dangle": ["off"],
    "max-len": [2, {"code": 120, "ignoreUrls": true, "ignoreStrings": true}],
    "no-restricted-syntax": 0,
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "vue/multi-word-component-names": "off",
    "function-paren-newline": 0,
    "no-return-await": "off",
    "arrow-parens": ["error", "as-needed", { "requireForBlockBody": true }],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "destructuredArrayIgnorePattern": "^_", "ignoreRestSiblings": true }],
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
    ],
    "no-param-reassign": [
      "error",
      {
        "props": true,
        "ignorePropertyModificationsFor": [
          "state",
          "acc",
          "e",
          "ctx",
          "req",
          "request",
          "res",
          "response",
          "$scope"
        ]
      }
    ]
  },
  settings: {
    "import/resolver": {
      webpack: {
        config: 'buildjs/dev.webpack.config.js'
      }
    }
  }
}
