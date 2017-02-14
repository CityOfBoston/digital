// @flow weak
/* eslint no-param-reassign: 0 */

import { makeStore } from '../store';
import type { State } from '../store';
import { setKeys } from '../store/modules/keys';

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

const nextHandler = (app, page, staticQuery) => ({ method, server, raw: { req, res }, query }, reply) => {
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
  };

  reply(app.renderToHTML(req, res, page, pageQuery));
};

const nextDefaultHandler = (app) => {
  const handler = app.getRequestHandler();
  return async ({ raw, url }, hapiReply) => {
    await handler(raw.req, raw.res, url);
    hapiReply.close(false);
  };
};

export { nextHandler, nextDefaultHandler };
