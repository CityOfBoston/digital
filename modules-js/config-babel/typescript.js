module.exports = function typescript() {
  return {
    plugins: [
      [require('@babel/plugin-proposal-decorators'), { legacy: true }],
      [require('@babel/plugin-proposal-class-properties'), { loose: true }],
      require('@babel/plugin-proposal-object-rest-spread'),
    ],
    presets: [require('@babel/preset-typescript')],
  };
};
