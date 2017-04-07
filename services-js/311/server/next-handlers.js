// @flow weak

import compression from 'compression';

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
    cloudinary: Object,
    mapbox: string,
  |},
  liveAgentButtonId: string,
|}

const nextHandler = (app, page, staticQuery) => async ({ method, server, raw: { req, res }, query, params }, reply) => {
  const requestAdditions: RequestAdditions = {
    hapiInject: server.inject.bind(server),
    apiKeys: {
      cloudinary: {
        url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD || ''}`,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
      },
      mapbox: process.env.MAPBOX_ACCESS_TOKEN || '',
    },
    liveAgentButtonId: process.env.LIVE_AGENT_BUTTON_ID || '',
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

export { nextHandler, nextDefaultHandler };
