// @flow

import { opbeatWrapGraphqlOptions } from './opbeat-graphql';

let opbeat: any;

beforeEach(() => {
  opbeat = {
    captureError: jest.fn(),
  };
});

describe('opbeatWrapGraphqlOptions', () => {
  it('sends context creation errors to opbeat', () => {
    const err = new Error();
    const fn = opbeatWrapGraphqlOptions(opbeat, () => {
      throw err;
    });

    expect(fn()).rejects.toBe(err);
    expect(opbeat.captureError).toHaveBeenCalledWith(err);
  });

  it('sends format error exceptions to opbeat', async () => {
    const hapiRequest = {
      raw: {
        req: {},
        res: {},
      },
    };
    const opts = await opbeatWrapGraphqlOptions(opbeat, () => ({}))(
      hapiRequest
    );

    const err = new Error();
    const graphQlError: any = new Error();
    graphQlError.originalError = err;

    const out = opts.formatError(graphQlError);

    expect(out).toBe(graphQlError);
    expect(opbeat.captureError).toHaveBeenCalledWith(err, {
      extra: expect.anything(),
      request: hapiRequest.raw.req,
    });
  });
});
