// @flow

import type Rollbar from 'rollbar';

// wraps a GraphQL options function such that errors thrown during creation and
// GraphQL processing get correctly sent to Rollbar.
export const rollbarWrapGraphqlOptions = (
  rollbar: Rollbar,
  optsFn: (req: any) => Object
) => async (req: any) => {
  try {
    const opts = await optsFn(req);

    const oldFormatError = opts.formatError;
    opts.formatError = (e: any) => {
      const request = req.raw && req.raw.req;
      const extra = {
        graphql: req.payload,
      };

      // graphql wraps the original exception
      let err;
      if (e.originalError instanceof Error) {
        err = e.originalError;
      } else {
        err = e;
      }

      if (!err.silent) {
        rollbar.error(err, request, extra);
      }

      return oldFormatError ? oldFormatError(e) : e;
    };

    return opts;
  } catch (e) {
    // stack trace and message are lost once we let the exception go through
    // the graphql-server-hapi error handler.
    rollbar.error(e);
    throw e;
  }
};
