// @flow weak

import compression from 'compression';

declare class HapiResponse {
  statusCode: number,
  result: any,
}

type HapiInject = (options: {|
  url: string,
  headers?: {[key: string]: string},
  method: string,
  payload: any,
|}) => Promise<HapiResponse>;

export type RequestAdditions = {|
  hapiInject: HapiInject,
  loopbackGraphqlCache: {[key: string]: mixed},
|};

export const nextHandler = (app, page, staticQuery) => async ({ method, server, raw: { req, res }, query, params, pre }, reply) => {
  const requestAdditions: RequestAdditions = {
    hapiInject: server.inject.bind(server),
    loopbackGraphqlCache: {},
  };

  Object.assign(req, requestAdditions);

  const pageQuery = {
    ...staticQuery,
    ...query,
    ...params,
  };

  const html = await app.renderToHTML(req, res, page, pageQuery);
  reply(html).code(res.statusCode);
};

export const nextDefaultHandler = (app) => {
  const compressionMiddleware = compression();
  const handler = app.getRequestHandler();

  return async ({ raw: { req, res }, url }, hapiReply) => {
    // Because Next.js writes to the raw response we don't get Hapi's built-in
    // gzipping. So, we run an express middleware that monkeypatches the raw
    // response to gzip its output.
    await new Promise((resolve) => { compressionMiddleware(req, res, resolve); });
    await handler(req, res, url);
    hapiReply.close(false);
  };
};
