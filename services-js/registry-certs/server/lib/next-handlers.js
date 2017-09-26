// @flow weak

import compression from 'compression';

export const nextHandler = (app, page = null, staticQuery = null) => async (
  { path, raw: { req, res }, query, params },
  reply
) => {
  const pageQuery = {
    ...staticQuery,
    ...query,
    ...params,
  };

  const html = await app.renderToHTML(req, res, page || path, pageQuery);
  reply(html).code(res.statusCode);
};

export const nextDefaultHandler = app => {
  const compressionMiddleware = compression();
  const handler = app.getRequestHandler();

  return async ({ raw: { req, res }, url }, hapiReply) => {
    // Because Next.js writes to the raw response we don't get Hapi's built-in
    // gzipping or cache control.. So, we run an express middleware that
    // monkeypatches the raw response to gzip its output.
    await new Promise(resolve => {
      compressionMiddleware(req, res, resolve);
    });
    await handler(req, res, url);
    hapiReply.close(false);
  };
};
