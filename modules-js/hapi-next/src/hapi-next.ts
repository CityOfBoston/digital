import querystring from 'querystring';
import compression from 'compression';

import {
  Server as HapiServer,
  ServerRoute,
  RouteOptions,
  Request as HapiRequest,
  Lifecycle,
  ResponseToolkit,
  RequestQuery,
} from 'hapi';
import { promisify } from 'util';

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
  app: any, // Next server object
  pathPrefix: string = '/',
  pageRouteOptions: RouteOptions | ((server: HapiServer) => RouteOptions) = {},
  staticRouteOptions:
    | RouteOptions
    | ((server: HapiServer) => RouteOptions) = {},
  externalAssetPrefix?: string
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
  // Next’s HEAD code seems to take assetPrefix into account, so once that ships
  // we should be able to un-hack all of the special handling of _next.
  const assetPrefix = app.dev ? '' : pathPrefix;
  app.setAssetPrefix(externalAssetPrefix || assetPrefix);

  const requestHandler = app.getRequestHandler();
  // compression returns a Next middleware, so we can use Promisify to turn its
  // "next" callback into a resolve.
  const compressionMiddleware = promisify(compression());

  // Next does not handle POSTs by default. We add this route so that it will
  // pass them in the normal render pipeline.
  app.router.add('POST', '/:path*', (req, res, _params, parsedUrl) =>
    app.render(req, res, parsedUrl.pathname, parsedUrl.query, parsedUrl)
  );

  const routes: ServerRoute[] = [
    {
      path: `${pathPrefix}{p*}`,
      method: ['GET', 'POST'],
      handler: makeNextHandler(app),
      options: pageRouteOptions,
    },
    {
      path: `${assetPrefix || '/'}_next/{p*}`,
      method: 'GET',
      options: {
        auth: false,
        ...staticRouteOptions,
      },
      handler: async ({ raw: { req, res }, params, query }, h) => {
        // Because Next.js writes to the raw response we don't get Hapi's built-in
        // gzipping or cache control.. So, we run an express middleware that
        // monkeypatches the raw response to gzip its output.
        await compressionMiddleware(req, res);

        // Next always expects its "_next" stuff to be mounted at "/", so we
        // pass a custom URL that emulates that.
        const deparsedQuery =
          typeof query === 'string' ? query : querystring.stringify(query);

        // The latest version of Next looks at req.url to match development
        // URLs, whereas in the past it used the third argument to the request
        // handler. Therefore, we have to update the request object.
        req.url = `/_next/${params.p}${
          deparsedQuery ? '?' + deparsedQuery : ''
        }`;

        await requestHandler(req, res);
        return h.close;
      },
    },
  ];

  return routes;
}

/**
 * Creates a Hapi handler method to generate HTML from Next. If the Hapi route
 * has any path parameters, those are merged into the query parameters and
 * passed to Next.
 *
 * @param app Next app
 * @param page If provided, the Next page that should be rendered. Used if this
 * is different from the request path, for example when we’re using a REST-like
 * path. E.g.: /certificates/12345 should be handled by the "certificates" page.
 */
export function makeNextHandler(
  app: any, // Next server object
  page: string | null = null
): Lifecycle.Method {
  return async (request: HapiRequest, h: ResponseToolkit) => {
    const {
      raw: { req, res },
      query,
      path,
      params,
    } = request;

    // Be consistent about having Next pages not having a slash. Unless it’s
    // only a slash.
    if (path.endsWith('/') && path !== '/' && request.method === 'get') {
      return h.redirect(path.slice(0, -1));
    }

    // We put the query hash together with Next’s route params and pass the
    // whole thing to Next.
    const combinedQuery = {
      ...(query as RequestQuery),
      ...params,
    };

    // Our actual pages are mounted at their expected paths (e.g.
    // /commissions/apply in the commissions app, not /apply) so we don’t
    // need to do any URL transforming.
    const html = await app.renderToHTML(req, res, page || path, combinedQuery);

    if (res.finished) {
      // This can happen when the page’s getInitialProps writes the HTTP headers
      // and closes the response (for, say, a 3xx). Since things have already
      // been written, we tell the Hapi stack not to touch the request anymore.
      // (Otherwise we get things like "Can't set headers after they are sent"
      // exceptions.)
      return h.abandon;
    } else {
      return h.response(html).code(res.statusCode);
    }
  };
}
