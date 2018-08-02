import compression from 'compression';

export const nextHandler = (
  app,
  page: string | null = null,
  staticQuery = {}
) => async ({ path, raw: { req, res }, query, params }, h) => {
  const pageQuery = {
    ...staticQuery,
    ...query,
    ...params,
  };

  const html = await app.renderToHTML(req, res, page || path, pageQuery);
  return h.response(html).code(res.statusCode);
};

export const nextDefaultHandler = app => {
  const compressionMiddleware = compression();
  const handler = app.getRequestHandler();

  return async ({ raw: { req, res }, url }, h) => {
    // Because Next.js writes to the raw response we don't get Hapi's built-in
    // gzipping or cache control.. So, we run an express middleware that
    // monkeypatches the raw response to gzip its output.
    await new Promise(resolve => {
      compressionMiddleware(req, res, resolve);
    });

    await handler(req, res, url);

    return h.close;
  };
};
