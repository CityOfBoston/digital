const { workspaces = [] } = require('./package.json');

// This is necessary for the Jest babel transformer — when it’s run from the
// repo’s root – to find each package’s .babelrc files.
//
// See: https://github.com/facebook/jest/issues/6053#issuecomment-383632515 And:
// https://github.com/vikr01/toms-shuttles/blob/dev/babel.config.js
module.exports = {
  babelrcRoots: workspaces.packages || workspaces,
};
