module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  plugins: ['react'],
  globals: {
    graphql: false,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'max-len': [2, 160, 4, { ignoreUrls: true, ignoreStrings: true }],
  },
};
