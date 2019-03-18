/**
 * This is a file for putting polyfill imports that are required by libraries
 * that we use commonly.
 *
 * For polyfilling ES6 utility functions your code uses (like Array.filter) you
 * can just use them, and our configuration of babel-env’s useBuiltIns option to
 * "usage" should cause Babel to automatically include necessary polyfills.
 */

// Issues arise in IE11: Stencil’s polyfill and core-js’ polyfill compete with each other in a neverending loop.
if (
  typeof window !== 'undefined' &&
  !('' + window['Map'.toString()]).includes('native code')
) {
  delete window['Map'.toString()];
}

if (
  typeof window !== 'undefined' &&
  !('' + window['Set'.toString()]).includes('native code')
) {
  delete window['Set'.toString()];
}

// React needs map and set
require('core-js/es6/map');
require('core-js/es6/set');

// Emotion needs weak-map
require('core-js/es6/weak-map');

// Yup needs map and Array.from
require('core-js/es6/map');
require('core-js/fn/array/from');

// fetch isn't in core-js, so the Babel env plugin can’t add it automatically on
// usage. Since it’s so useful (and easy to forget when it’s not available) we
// polyfill it by default.
require('isomorphic-fetch');
