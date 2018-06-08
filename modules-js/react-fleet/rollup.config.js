const EXTERNALS = ['react'];

export default {
  input: 'build/react-fleet.js',
  output: {
    file: 'build/react-fleet.es5.js',
    format: 'cjs',
  },
  // Regexp form so we can wildcard
  external: id => /^@babel\/runtime\//.test(id) || EXTERNALS.includes(id),
};
