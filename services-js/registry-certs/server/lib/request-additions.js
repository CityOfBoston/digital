// @flow

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

export type RequestAdditions = {|
  hapiInject: HapiInject,
|};

export default (handler: (request: mixed, h: mixed) => mixed) => (
  request: any,
  h: mixed
) => {
  const { server, raw: { req } } = request;

  const requestAdditions: RequestAdditions = {
    hapiInject: server.inject.bind(server),
  };

  Object.assign(req, requestAdditions);

  return handler(request, h);
};
