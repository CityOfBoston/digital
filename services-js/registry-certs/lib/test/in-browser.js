/**
 * Executes the given (possibly async) function with process.browser
 * set to true. Resets it back to false afterwards.
 */
export default async function inBrowser(fn) {
  if (process.browser) {
    throw new Error('Process is already running with browser = true');
  }

  try {
    process.browser = true;
    return await fn();
  } finally {
    process.browser = false;
  }
}
