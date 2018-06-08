const EXTERNALS = ['react'];

export default {
  input: 'build/{{name}}.js',
  output: {
    file: 'build/{{name}}.es5.js',
    format: 'cjs',
  },
  // Regexp form so we can wildcard
  external: id => /^@babel\/runtime\//.test(id) || EXTERNALS.includes(id),
};
