module.exports = function typescript() {
  return {
    plugins: [
      // For Storybook, these first two may need to be duplicated into the app’s
      // own .babelrc file to fix the "Decorators transform is necessary." error
      // message.
      [require('@babel/plugin-proposal-decorators'), { legacy: true }],
      [require('@babel/plugin-proposal-class-properties'), { loose: true }],
      require('@babel/plugin-proposal-object-rest-spread'),
    ],
    presets: [require('@babel/preset-typescript')],
  };
};
