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
  loopbackGraphqlCache: { [key: string]: mixed },
|};

export default (handler: (request: mixed, reply: mixed) => mixed) => (
  request: any,
  reply: mixed
) => {
  const { server, raw: { req } } = request;

  const requestAdditions: RequestAdditions = {
    hapiInject: server.inject.bind(server),
    loopbackGraphqlCache: {},
  };

  Object.assign(req, requestAdditions);

  handler(request, reply);
};
