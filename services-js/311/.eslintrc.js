module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    jest: true,
    es6: true,
    node: true,
  },
  plugins: ['flowtype', 'import', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:flowtype/recommended',
    'prettier',
    'prettier/flowtype',
    'prettier/react',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
      },
    ],
  },
};
