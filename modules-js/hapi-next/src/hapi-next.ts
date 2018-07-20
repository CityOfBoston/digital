import url from 'url';
import next from 'next';
import { ServerRoute } from 'hapi';

/**
 * Makes a Hapi route object to render the Next app from the given module at the
 * given path prefix. Path prefixes are important so we can mount several Next
 * apps at the same apps.boston.gov domain.
 *
 * Sets the assetPrefix on the app so that it loads all static files from
 * underneath the subpath.
 *
 * @param app Next Server object
 * @param pathPrefix Root of the paths for this app. Must start and end with a
 * "/".
 *
 * @example
 * server.route(
 *   makeRoutesForNextApp(
 *     next({…}),
 *    '/subpath/'
 *   )
 * );
 */
export function makeRoutesForNextApp(
  app: next.Server,
  pathPrefix: string
): ServerRoute[] {
  if (pathPrefix !== '/' && !pathPrefix.match(/^\/.*\/$/)) {
    throw new Error(
      `Path prefix "${pathPrefix}" must begin and end with a '/' character`
    );
  }

  // In dev we serve the Next app at /_next/ because the hot module reloading
  // code doesn't take into account having a prefix. In prod, though, we serve
  // our _next directory at the prefix because that’s the only place our app
  // will get traffic.
  //
  // TODO(finh): Allow for custom assetPrefix for CDNs.
  const assetPrefix = app.dev ? '/' : pathPrefix;
  app.setAssetPrefix(assetPrefix);

  const requestHandler = app.getRequestHandler();

  const routes: ServerRoute[] = [
    {
      path: `${pathPrefix}{p*}`,
      method: ['GET', 'POST'],
      handler: async ({ raw: { req, res } }, h) => {
        // Our actual pages are mounted at their expected paths (e.g.
        // /commissions/apply in the commissions app, not /apply) so we don’t
        // need to do any URL transforming.
        await requestHandler(req, res);
        return h.close;
      },
    },
    {
      path: `${assetPrefix}_next/{p*}`,
      method: 'GET',
      options: {
        auth: false,
      },
      handler: async ({ raw: { req, res }, params }, h) => {
        // Next always expects its "_next" stuff to be mounted at "/", so we
        // pass a custom URL that emulates that.
        await requestHandler(req, res, url.parse(`/_next/${params.p}`));
        return h.close;
      },
    },
  ];

  return routes;
}
