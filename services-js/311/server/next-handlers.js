// @flow weak

declare class HapiResponse {
  statusCode: number,
  result: any,
}

type HapiInject = (options: {|
  url: string,
  method: string,
  payload: any,
|}) => Promise<HapiResponse>;

export type RequestAdditions = {|
  hapiInject: HapiInject,
  apiKeys: {|
    google: string,
  |},
|}

const nextHandler = (app, page, staticQuery) => async ({ method, server, raw: { req, res }, query, params }, reply) => {
  const requestAdditions: RequestAdditions = {
    hapiInject: server.inject.bind(server),
    apiKeys: {
      google: process.env.GOOGLE_API_KEY || '',
    },
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

const nextDefaultHandler = (app) => {
  const handler = app.getRequestHandler();
  return async ({ raw, url }, hapiReply) => {
    await handler(raw.req, raw.res, url);
    hapiReply.close(false);
  };
};

export { nextHandler, nextDefaultHandler };
