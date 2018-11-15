/* eslint no-console: 0 */

// wraps a GraphQL options function such that errors thrown during creation and
// GraphQL processing get correctly sent to Opbeat.
export const opbeatWrapGraphqlOptions = (
  opbeat: any,
  optsFn: ((req: any) => any)
) => async (req: any) => {
  try {
    const opts = await optsFn(req);
    const oldFormatError = opts.formatError;

    opts.formatError = (e: any) => {
      // graphql wraps the original exception
      const errToReport = e.originalError || e;

      // This allows internal exceptions to pass data to Opbeat by setting an
      // "extra" object.
      const extra = Object.assign({}, errToReport.extra);

      let reqPayload = req.payload;

      // Typically req.payload has been parsed to a JSON object but we want to
      // just be sure.
      if (typeof reqPayload === 'string') {
        try {
          reqPayload = JSON.parse(reqPayload);
        } catch (jsonErr) {
          // We want to be defensive and not throw errors in our error
          // reporting.
          console.error(`Could not parse JSON payload: ${reqPayload}`);
          extra.payload = reqPayload;
          reqPayload = null;
        }
      }

      if (typeof reqPayload === 'object') {
        Object.assign(extra, reqPayload);
      }

      const errorPayload = {
        request: req.raw && req.raw.req,
        extra,
      };

      opbeat.captureError(errToReport, errorPayload);

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
