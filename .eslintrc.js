module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'plugin:vue/essential',
    'airbnb-base'
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
    "comma-dangle": ["off"],
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
  }
}
