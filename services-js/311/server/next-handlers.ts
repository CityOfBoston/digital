import compression from 'compression';

interface Language {
  code: string;
  region: string | undefined;
  quality: number;
}
export interface RequestAdditions {
  languages: Language[];
}

export const nextHandler = (app, page, staticQuery = {}) => async (
  { raw: { req, res }, query, params, pre },
  h
) => {
  const requestAdditions: RequestAdditions = {
    languages: pre.language,
  };

  Object.assign(req, requestAdditions);

  const pageQuery = {
    ...staticQuery,
    ...query,
    ...params,
  };

  const html = await app.renderToHTML(req, res, page, pageQuery);
  return h.response(html).code(res.statusCode);
};

export const nextDefaultHandler = app => {
  const compressionMiddleware = compression();
  const handler = app.getRequestHandler();

  return async ({ raw: { req, res }, url }, h) => {
    // Because Next.js writes to the raw response we don't get Hapi's built-in
    // gzipping or cache control.. So, we run an express middleware that
    // monkeypatches the raw response to gzip its output, and set our own
    // cache header.
    await new Promise(resolve => {
      compressionMiddleware(req, res, resolve);
    });
    await handler(req, res, url);

    return h.close;
  };
};
