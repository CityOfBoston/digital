// Rollup won’t package libraries in. It’s up to the bundlers (e.g. Webpack) to
// resolve these libraries when building the apps. Since we’re in a monorepo,
// the libraries will be available without the apps having to add the
// dependencies themselves. Nevertheless, these should be added as both
// peerDependencies and devDependencies in package.json, since we’re pedantic.
const EXTERNALS = [
  'react',
  'react-dom',
  'react-dropzone',
  '@emotion/core',
  '@emotion/css',
  'string-hash',
  'detect-browser',
];

export default {
  input: 'build/react-fleet.js',
  output: {
    file: 'build/react-fleet.es5.js',
    format: 'cjs',
  },
  // Regexp form so we can wildcard
  external: id =>
    /^@babel\/runtime\//.test(id) ||
    /^core-js\//.test(id) ||
    EXTERNALS.includes(id),
};
