// @flow

type Opbeat = $Exports<'opbeat'>;

// wraps a GraphQL options function such that errors thrown during creation and
// GraphQL processing get correctly sent to Opbeat.
export const opbeatWrapGraphqlOptions = (
  opbeat: Opbeat,
  optsFn: (req: any) => Object,
) => async (req: any) => {
  try {
    const opts = await optsFn(req);

    const oldFormatError = opts.formatError;
    opts.formatError = (e: Error) => {
      const payload = {
        request: req.raw && req.raw.req,
        extra: {
          graphql: req.payload,
        },
      };

      let err;
      if (e.originalError instanceof Error) {
        err = e.originalError;
      } else {
        err = e;
      }

      // graphql wraps the original exception
      opbeat.captureError(err, payload);

      return oldFormatError ? oldFormatError(e) : e;
    };

    return opts;
  } catch (e) {
    // stack trace and message are lost once we let the exception go through
    // the graphql-server-hapi error handler.
    opbeat.captureError(e);
    throw e;
  }
};
