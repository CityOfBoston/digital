module.exports = function typescript() {
  return {
    plugins: [
      require('@babel/plugin-proposal-class-properties'),
      require('@babel/plugin-proposal-object-rest-spread'),
    ],
    presets: [require('@babel/preset-typescript')],
  };
};
