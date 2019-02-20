/**
 * Preset to add to .babelrc for Node-only libraries and services (typically
 * along with the `@cityofboston/config-babel/typescript` preset). Uses
 * `@babel/preset-env` to target the current version of Node. For the most part
 * the only effect is to convert to CommonJS modules.
 */
module.exports = () => ({
  presets: [[require('@babel/preset-env'), { targets: { node: true } }]],
});
