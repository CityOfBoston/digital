import Hapi from 'hapi';

declare class HapiResponse {
  statusCode: number;
  result: any;
}

type HapiInject = (
  options: {
    url: string;
    headers?: { [key: string]: string };
    method: string;
    payload: any;
  }
) => Promise<HapiResponse>;

export type RequestAdditions = {
  hapiInject: HapiInject;
};

export default (
  handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => unknown
) => (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const {
    server,
    raw: { req },
  } = request;

  const requestAdditions: RequestAdditions = {
    hapiInject: server.inject.bind(server),
  };

  Object.assign(req, requestAdditions);

  return handler(request, h);
};
