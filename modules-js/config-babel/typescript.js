/**
 * Babel preset that includes `@babel/preset-typescript` to handle stripping
 * TypeScript’s syntax. Also includes the transforms necessary for
 * TypeScript-compatible decorators and static properties.
 *
 * Every .babelrc in this repo should probably include this preset.
 */
module.exports = () => ({
  presets: [require('@babel/preset-typescript')],
  plugins: [
    [require('@babel/plugin-proposal-decorators'), { legacy: true }],
    [require('@babel/plugin-proposal-class-properties'), { loose: true }],
  ],
});
