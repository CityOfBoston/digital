// @flow weak

import newrelic from 'newrelic';

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
  newRelicScript: string,
  hapiInject: HapiInject,
  apiKeys: {|
    google: string,
  |},
|}

const nextHandler = (app, page, staticQuery) => async ({ method, server, raw: { req, res }, query, params }, reply) => {
  let newRelicScript = newrelic.getBrowserTimingHeader();
  if (newRelicScript) {
    newRelicScript = newRelicScript.replace(/<\/?script[^<]*>/g, '');
  }

  const requestAdditions: RequestAdditions = {
    newRelicScript,
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
