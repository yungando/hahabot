const eslintBaseConfig = require('eslint-config-eslint/base');
const eslintFormattingConfig = require('eslint-config-eslint/formatting');
const globals = require('globals');

const eslintBaseConfigRuleOverrides = {
  '@eslint-community/eslint-comments/require-description': 'off',
  'array-callback-return': [
    'error',
    {
      allowImplicit: true,
    },
  ],
  'block-scoped-var': 'error',
  camelcase: [
    'error',
    {
      properties: 'never',
    },
  ],
  curly: [
    'error',
    'multi-line',
  ],
  'func-style': 'off',
  'global-require': 'error',
  'implicit-arrow-linebreak': [
    'error',
    'beside',
  ],
  'jsdoc/require-jsdoc': 'off',
  'lines-between-class-members': [
    'error',
  ],
  'max-classes-per-file': [
    'error',
    1,
  ],
  'new-cap': [
    'error',
    {
      capIsNewExceptions: [
        'Immutable.Map',
        'Immutable.Set',
        'Immutable.List',
      ],
      properties: false,
    },
  ],
  'newline-per-chained-call': [
    'error',
    {
      ignoreChainWithDepth: 3,
    },
  ],
  'no-bitwise': 'error',
  'no-buffer-constructor': [
    'error',
  ],
  'no-cond-assign': [
    'error',
    'always',
  ],
  'no-empty-function': [
    'error',
    {
      allow: [
        'arrowFunctions',
        'methods',
      ],
    },
  ],
  'no-extra-label': [
    'error',
  ],
  'no-lonely-if': [
    'error',
  ],
  'no-multi-assign': [
    'error',
  ],
  'no-new-require': [
    'error',
  ],
  'no-param-reassign': [
    'error',
    {
      props: true,
      ignorePropertyModificationsFor: [
        'acc',
        'accumulator',
        'e',
        'ctx',
        'context',
        'req',
        'request',
        'res',
        'response',
        '$scope',
        'staticContext',
      ],
    },
  ],
  'no-path-concat': [
    'error',
  ],
  'no-plusplus': [
    'error',
  ],
  'no-promise-executor-return': [
    'error',
  ],
  'no-restricted-exports': [
    'error',
    {
      restrictedNamedExports: [
        'default',
        'then',
      ],
    },
  ],
  'no-restricted-syntax': [
    'error',
    'DebuggerStatement',
    'LabeledStatement',
    'WithStatement',
  ],
  'no-return-assign': [
    'error',
    'always',
  ],
  'no-return-await': [
    'error',
  ],
  'no-spaced-func': [
    'error',
  ],
  'no-template-curly-in-string': [
    'error',
  ],
  'no-undefined': 'off',
  'no-unneeded-ternary': [
    'error',
    {
      defaultAssignment: false,
    },
  ],
  'no-unused-vars': [
    'error',
    {
      vars: 'all',
      args: 'after-used',
      caughtErrors: 'all',
    },
  ],
  'no-void': [
    'error',
  ],
  'nonblock-statement-body-position': [
    'error',
  ],
  'object-shorthand': [
    'error',
    'always',
    {
      ignoreConstructors: false,
      avoidQuotes: true,
    },
  ],
  'one-var': [
    'error',
    'never',
  ],
  'padded-blocks': [
    'error',
    {
      blocks: 'never',
      classes: 'never',
      switches: 'never',
    },
    {
      allowSingleLineBlocks: true,
    },
  ],
  'prefer-destructuring': [
    'error',
    {
      VariableDeclarator: {
        array: false,
        object: true,
      },
      AssignmentExpression: {
        array: true,
        object: false,
      },
    },
    {
      enforceForRenamedProperties: false,
    },
  ],
  'prefer-object-spread': [
    'error',
  ],
  'prefer-regex-literals': [
    'error',
    {
      disallowRedundantWrapping: true,
    },
  ],
  quotes: [
    'error',
    'single',
    {
      avoidEscape: true,
    },
  ],
  'require-unicode-regexp': 'off',
  'valid-typeof': [
    'error',
    {
      requireStringLiterals: true,
    },
  ],
  'vars-on-top': [
    'error',
  ],
  yoda: [
    'error',
    'never',
    {
      exceptRange: false,
      onlyEquality: false,
    },
  ],
  strict: 'off',
  'no-console': 'off',
};

const eslintFormattingConfigRuleOverrides = {
  'arrow-parens': [
    'error',
    'always',
  ],
  'brace-style': [
    'error',
    '1tbs',
    {
      allowSingleLine: true,
    },
  ],
  'comma-dangle': [
    'error',
    'always-multiline',
  ],
  'function-paren-newline': [
    'error',
    'multiline-arguments',
  ],
  indent: [
    'error',
    2,
    {
      SwitchCase: 1,
    },
  ],
  'lines-around-comment': 'off',
  'max-len': [
    'error',
    100,
    2,
    {
      ignoreComments: true,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
    },
  ],
  'max-statements-per-line': 'off',
  'no-multiple-empty-lines': [
    'error',
    {
      max: 1,
    },
  ],
  'object-curly-newline': [
    'error',
    {
      ObjectExpression: {
        minProperties: 4,
        multiline: true,
        consistent: true,
      },
      ObjectPattern: {
        minProperties: 4,
        multiline: true,
        consistent: true,
      },
    },
  ],
  'operator-linebreak': [
    'error',
    'before',
    {
      overrides: {
        '=': 'none',
      },
    },
  ],
  'padding-line-between-statements': 'off',
  'quote-props': [
    'error',
    'as-needed',
    {
      keywords: false,
      numbers: false,
    },
  ],
  quotes: [
    'error',
    'single',
    {
      avoidEscape: true,
    },
  ],
  'space-before-function-paren': [
    'error',
    {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always',
    },
  ],
};

module.exports = [
  ...eslintBaseConfig,
  eslintFormattingConfig,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      ...eslintBaseConfigRuleOverrides,
      ...eslintFormattingConfigRuleOverrides,
    },
  },
];
