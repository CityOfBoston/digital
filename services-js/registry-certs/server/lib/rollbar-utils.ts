import Rollbar from 'rollbar';

// wraps a GraphQL options function such that errors thrown during creation and
// GraphQL processing get correctly sent to Rollbar.
export const rollbarWrapGraphqlOptions = (
  rollbar: Rollbar,
  optsFn: (req: any) => any
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

// https://docs.rollbar.com/docs/javascript#section-using-hapi
export const hapiPlugin = {
  name: 'rollbar',

  register: async function(server: any, { rollbar }: { rollbar: Rollbar }) {
    const preResponse = (request, h) => {
      const response = request.response;

      if (!rollbar || !response.isBoom) {
        return h.continue;
      }

      const cb = rollbarErr => {
        if (rollbarErr) {
          // eslint-disable-next-line no-console
          console.error(`Error reporting to rollbar, ignoring: ${rollbarErr}`);
        }
      };

      const error = response;

      if (error instanceof Error) {
        rollbar.error(error, request, cb);
      } else {
        rollbar.error(`Error: ${error}`, request, cb);
      }

      return h.continue;
    };

    server.ext('onPreResponse', preResponse);
    server.expose('rollbar', rollbar);
  },
};
