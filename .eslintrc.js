module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  parser: 'babel-eslint',
  plugins: ['emotion', 'prettier', 'react-hooks'],
  extends: ['eslint:recommended', 'prettier', 'prettier/react'],
  rules: {
    // Causes Emotion to add a @jsx pragma and import when the css prop is used
    'emotion/jsx-import': 'error',
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // As of eslint 5.16.0, getter-return breaks with a "Cannot read
        // property 'sync' of undefined" error when it encounters an abstract
        // TypeScript method, so we disable it.
        'getter-return': 0,

        // These two are also handled by TypeScript automatically.
        'no-unused-vars': 0,
        'no-undef': 0,
      },
    },
  ],
};
