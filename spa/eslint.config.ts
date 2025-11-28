import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import eslint from "@eslint/js";
import typescriptEslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import stylisticJs from '@stylistic/eslint-plugin-js'

import viteConfig from "./vite.config";

export default typescriptEslint.config(
    {
        extends: [
            eslint.configs.recommended,
            typescriptEslint.configs.recommendedTypeChecked,
            importPlugin.flatConfigs.recommended,
            ...pluginVue.configs['flat/recommended'],
        ],
        plugins: {
            '@stylistic/js': stylisticJs
        },
        ignores: [
            '**/public/js/*.js',
            '**/js/phoenix/*.js',
            '**/src/utils/petite-vue.es.js',
            '**/src/shims-vue.d.ts',
            'vite.config.ts',
            'vite.player.config.ts',
            'eslint.config.ts',
            'public/**',
        ],
        files: ['**/*.{ts,vue,js}'],
        languageOptions: {
            sourceType: 'module',
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                projectService: true,
                // @ts-ignore
                tsconfigRootDir: import.meta.dirname,
                // project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.app.json'],
                ecmaVersion: 'latest',
                parser: "@typescript-eslint/parser",
                extraFileExtensions: [".vue"]
            },
        },
        settings: {
            "import/resolver": {
                vite: {
                    viteConfig: viteConfig
                },
                alias: {
                    map: [["@", "./src"]],
                },
            },
        },
        rules: {
            "semi": ["off"],
            "@stylistic/js/max-len": ["error", { code: 120, "ignoreUrls": true, "ignoreStrings": true }],
            "@stylistic/js/operator-linebreak": ["error", "before"],
            "func-names": ["error"],
            "object-shorthand": ["error", "always"],
            'no-undef': ["error"],
            "@typescript-eslint/semi": ["off"],
            "comma-dangle": "off",
            "@typescript-eslint/comma-dangle": "off",
            'no-restricted-syntax': 0,
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-redundant-type-constituents': 'off',
            'function-paren-newline': 0,
            'no-alert': 'off',
            'no-plusplus': ["error", {"allowForLoopAfterthoughts": true}],
            'arrow-parens': ['error', 'as-needed', {requireForBlockBody: true}],
            // 'no-unused-vars': ['error', { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', ignoreRestSiblings: true }],
            '@typescript-eslint/no-unused-vars': [
                "error",
                {
                    "args": "all",
                    "argsIgnorePattern": "^_",
                    "caughtErrors": "all",
                    "caughtErrorsIgnorePattern": "^_",
                    "destructuredArrayIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "ignoreRestSiblings": true
                }
            ],
            'no-unused-vars': 'off',
            'import/no-extraneous-dependencies': ['error', {devDependencies: true}],
            'import/extensions': 'off',
            'no-prototype-builtins': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/html-self-closing': 'off',
            'vue/html-indent': 'off',
            "vue/singleline-html-element-content-newline": 'off',
            "vue/attribute-hyphenation": 'off',
            "vue/v-on-event-hyphenation": 'off',
            'vue/multi-word-component-names': 'off',
            'vue/html-closing-bracket-newline': 'off',
            "vue/first-attribute-linebreak": ["error", {
                "singleline": "ignore",
                "multiline": "ignore"
            }],
            "vue/order-in-components": ["error", {
                "order": [
                    "el",
                    "name",
                    "key",
                    "parent",
                    "functional",
                    ["delimiters", "comments"],
                    ["components", "directives", "filters"],
                    "extends",
                    "mixins",
                    ["provide", "inject"],
                    "layout",
                    "middleware",
                    "validate",
                    "scrollToTop",
                    "transition",
                    "loading",
                    "inheritAttrs",
                    "model",
                    ["props", "propsData"],
                    "slots",
                    "expose",
                    "setup",
                    "asyncData",
                    "data",
                    "emits",
                    "fetch",
                    "head",
                    "LIFECYCLE_HOOKS",
                    "ROUTER_GUARDS",
                    "watch",
                    "watchQuery",
                    "computed",
                    "methods",
                    ["template", "render"],
                    "renderError"
                ]
            }],
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
    }
)