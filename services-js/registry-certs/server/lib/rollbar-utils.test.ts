import { rollbarWrapGraphqlOptions } from './rollbar-utils';

let rollbar: any;

beforeEach(() => {
  rollbar = {
    error: jest.fn(),
  };
});

describe('rollbarWrapGraphqlOptions', () => {
  it('sends context creation errors to rollbar', () => {
    const err = new Error();
    const fn = rollbarWrapGraphqlOptions(rollbar, () => {
      throw err;
    });

    expect(fn({} as any)).rejects.toBe(err);
    expect(rollbar.error).toHaveBeenCalledWith(err);
  });

  it('sends format error exceptions to rollbar', async () => {
    const hapiRequest = {
      raw: {
        req: {},
        res: {},
      },
    };
    const opts = await rollbarWrapGraphqlOptions(rollbar, () => ({
      formatError: e => e,
    }))(hapiRequest);

    const err = new Error();
    const graphQlError: any = new Error();
    graphQlError.originalError = err;

    const out = opts.formatError(graphQlError);

    expect(out).toBe(graphQlError);
    expect(rollbar.error).toHaveBeenCalledWith(
      err,
      hapiRequest.raw.req,
      expect.anything()
    );
  });
});
