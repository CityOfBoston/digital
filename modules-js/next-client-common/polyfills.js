/**
 * This is a file for putting polyfill imports that are required by libraries
 * that we use commonly.
 *
 * For polyfilling ES6 utility functions your code uses (like Array.filter) you
 * can just use them, and our configuration of babel-env’s useBuiltIns option to
 * "usage" should cause Babel to automatically include necessary polyfills.
 */

// Issues arise in IE11: Stencil’s polyfill and core-js’ polyfill compete with
// each other in a neverending loop because core-js tries to extend the
// existing polyfill, which breaks a "constructor" check.
//
// If we detect that Map or Set has been polyfilled, we delete that polyfill
// and let core-js install its own.
//
// 'toString' used to keep babel-preset-env from thinking that we're using
// Set and Map and prefixing this file with the core-js polyfill before we
// can clean things up for it.
if (
  typeof window !== 'undefined' &&
  ('' + window['Map'.toString()]).indexOf('native code') === -1
) {
  delete window['Map'.toString()];
}

if (
  typeof window !== 'undefined' &&
  ('' + window['Set'.toString()]).indexOf('native code') === -1
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
