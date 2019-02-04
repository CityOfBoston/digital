import path from 'path';

/**
 * Absolute path to the root of our subpackage within the monorepo.
 */
export const PACKAGE_SRC_ROOT: string = path.resolve(
  // We normalize between this file being run from the source directory and
  // being run from the build directory (which is one level deeper).
  __dirname.replace('/registry-certs/build/', '/registry-certs/'),
  '../'
);
