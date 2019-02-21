const path = require('path');

/**
 * Next.js config mixin that adds polyfills.js to the beginning of the webpack
 * entries. This file contains the polyfills that are necessary for our common
 * libraries (like React, Emotion, and Formik/Yup) to work across browsers.
 *
 * For polyfills that our own code needs, we use preset-env’s "usage" behavior,
 * which is set in @cityofboston/config-babel/next.
 *
 * While we only officially support IE11+ and latest versions of evergreen
 * browsers, if we can support someone’s older phone by dropping in the right
 * polyfill that seems worth it to do.
 */
module.exports = () => nextConfig =>
  Object.assign({}, nextConfig, {
    webpack(config, options) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        const polyfillsPath = path.resolve(__dirname, 'polyfills.js');

        if (entries['main.js'] && !entries['main.js'].includes(polyfillsPath)) {
          entries['main.js'].unshift(polyfillsPath);
        }

        return entries;
      };

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
