// Utility file for automatically calling initialization functions when page
// modules are run. We delegate to a separate module so that that module can be
// tested without automatically running on import.
//
// Note that this is called for every page on the browser, but only once on the
// server when the app is first interpreted on startup.
//
// This is typically imported and then the page component is require'd in. Using
// require enforces an execution order such that initBrowser can e.g. hydrate
// CSS-in-JS libraries before the "css" method is called during component module
// execution.

import { initBrowser } from './app';

if ((process as any).browser) {
  initBrowser();
}
