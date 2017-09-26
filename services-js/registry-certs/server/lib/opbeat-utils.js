// @flow
/* eslint no-console: 0 */

import os from 'os';
import fetch from 'node-fetch';

type Opbeat = $Exports<'opbeat'>;

// wraps a GraphQL options function such that errors thrown during creation and
// GraphQL processing get correctly sent to Opbeat.
export const opbeatWrapGraphqlOptions = (
  opbeat: Opbeat,
  optsFn: (req: any) => Object
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

// https://opbeat.com/docs/api/intake/v1/#release-tracking
export async function reportDeployToOpbeat(opbeat: Opbeat, appId: ?string) {
  if (
    appId &&
    process.env.OPBEAT_ORGANIZATION_ID &&
    process.env.OPBEAT_SECRET_TOKEN &&
    process.env.GIT_BRANCH &&
    process.env.GIT_REVISION
  ) {
    try {
      const res = await fetch(
        `https://opbeat.com/api/v1/organizations/${process.env
          .OPBEAT_ORGANIZATION_ID}/apps/${appId}/releases/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${process.env.OPBEAT_SECRET_TOKEN}`,
          },
          body: [
            `rev=${process.env.GIT_REVISION}`,
            `branch=${encodeURIComponent(process.env.GIT_BRANCH)}`,
            `machine=${encodeURIComponent(os.hostname())}`,
            `status=machine-completed`,
          ].join('&'),
        }
      );
      console.log(
        `Reported ${appId} deploy to Opbeat:`,
        JSON.stringify(await res.json())
      );
    } catch (err) {
      // We swallow the error because we won't interrupt startup because we
      // couldn't report the release.
      console.error(`Error reporting ${appId} deploy to Opbeat`);

      // bwaaaaaa
      opbeat.captureError(err);
    }
  }
}
