// Rollup won’t package libraries in. It’s up to the bundlers (e.g. Webpack) to
// resolve these libraries when building the apps. Since we’re in a monorepo,
// the libraries will be available without the apps having to add the
// dependencies themselves. Nevertheless, these should be added as both
// peerDependencies and devDependencies in package.json, since we’re pedantic.
const EXTERNALS = [
  'react',
  'emotion',
  'regenerator-runtime/runtime',
  'nprogress',
];

export default {
  input: 'build/next-client-common.js',
  output: {
    file: 'build/next-client-common.es5.js',
    format: 'cjs',
  },
  // Regexp form so we can wildcard
  external: id =>
    /^@babel\/runtime\//.test(id) ||
    /^core-js\//.test(id) ||
    /^next\//.test(id) ||
    EXTERNALS.includes(id),
};
