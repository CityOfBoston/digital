global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};

// jsdom does not support this method. Defining it here will prevent
// “Error: Not implemented: window.scroll” from printing to the console
// when running tests.
window.scroll = () => {};

export {};
