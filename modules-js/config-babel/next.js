/**
 * Preset for enabling the next/babel preset and configuring its
 * `@babel/preset-env` to our needs, as well as other common Next / React /
 * webapp things we need.
 *
 * Sets preset-env’s polyfill policy to "usage". This will automatically include
 * any polyfills we use in our compiled code (though *not* node_modules) for
 * things like ES6 Array methods that we keep forgetting that IE11 doesn’t have.
 */
module.exports = () => ({
  presets: [
    [
      require('next/babel'),
      {
        'preset-env': {
          useBuiltIns: 'usage',
          corejs: 2,
        },
      },
    ],
  ],
});
