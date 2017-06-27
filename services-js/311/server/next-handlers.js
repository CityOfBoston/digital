// @flow weak

import compression from 'compression';

declare class HapiResponse {
  statusCode: number,
  result: any,
}

type HapiInject = (options: {|
  url: string,
  headers?: { [key: string]: string },
  method: string,
  payload: any,
|}) => Promise<HapiResponse>;

type Language = {|
  code: string,
  region: ?string,
  quality: number,
|};

export type RequestAdditions = {|
  hapiInject: HapiInject,
  languages: Language[],
  apiKeys: {|
    cloudinary: Object,
    mapbox: Object,
  |},
  liveAgentButtonId: string,
  loopbackGraphqlCache: { [key: string]: mixed },
|};

export const nextHandler = (app, page, staticQuery) => async (
  { server, raw: { req, res }, query, params, pre },
  reply,
) => {
  const requestAdditions: RequestAdditions = {
    hapiInject: server.inject.bind(server),
    languages: pre.language,
    apiKeys: {
      cloudinary: {
        url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD ||
          ''}`,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
      },
      mapbox: {
        accessToken: process.env.MAPBOX_ACCESS_TOKEN || '',
        stylePath: process.env.MAPBOX_STYLE_PATH || '',
      },
    },
    liveAgentButtonId: process.env.LIVE_AGENT_BUTTON_ID || '',
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

export const nextDefaultHandler = app => {
  const compressionMiddleware = compression();
  const handler = app.getRequestHandler();

  return async ({ raw: { req, res }, url }, hapiReply) => {
    // Because Next.js writes to the raw response we don't get Hapi's built-in
    // gzipping or cache control.. So, we run an express middleware that
    // monkeypatches the raw response to gzip its output, and set our own
    // cache header.
    await new Promise(resolve => {
      compressionMiddleware(req, res, resolve);
    });
    await handler(req, res, url);
    hapiReply.close(false);
  };
};
