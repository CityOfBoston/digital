// @flow weak

import { makeStore } from '../data/store';
import type { State } from '../data/store';
import { setKeys } from '../data/store/keys';

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
  reduxInitialState: State,
|}

const nextHandler = (app, page, staticQuery) => async ({ method, server, raw: { req, res }, query, params }, reply) => {
  const store = makeStore();
  store.dispatch(setKeys({
    googleApi: process.env.GOOGLE_API_KEY,
  }));

  const requestAdditions: RequestAdditions = {
    hapiInject: server.inject.bind(server),
    reduxInitialState: store.getState(),
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
