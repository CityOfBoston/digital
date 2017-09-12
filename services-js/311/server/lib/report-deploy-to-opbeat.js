// @flow
/* eslint no-console: 0 */

import 'isomorphic-fetch';
import os from 'os';

export default async function reportDeployToOpbeat(opbeat: any) {
  const {
    OPBEAT_APP_ID,
    OPBEAT_ORGANIZATION_ID,
    OPBEAT_FRONTEND_APP_ID,
    OPBEAT_FRONTEND_ORGANIZATION_ID,
    OPBEAT_SECRET_TOKEN,
    GIT_BRANCH,
    GIT_REVISION,
  } = process.env;

  if (
    OPBEAT_APP_ID &&
    OPBEAT_ORGANIZATION_ID &&
    OPBEAT_SECRET_TOKEN &&
    OPBEAT_FRONTEND_APP_ID &&
    OPBEAT_FRONTEND_ORGANIZATION_ID &&
    GIT_BRANCH &&
    GIT_REVISION
  ) {
    try {
      let res = await fetch(
        `https://opbeat.com/api/v1/organizations/${OPBEAT_ORGANIZATION_ID}/apps/${OPBEAT_APP_ID}/releases/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${OPBEAT_SECRET_TOKEN}`,
          },
          body: [
            `rev=${GIT_REVISION}`,
            `branch=${encodeURIComponent(GIT_BRANCH)}`,
            `machine=${encodeURIComponent(os.hostname())}`,
            `status=machine-completed`,
          ].join('&'),
        }
      );
      console.log(
        'Reported server deploy to Opbeat:',
        JSON.stringify(await res.json())
      );

      res = await fetch(
        `https://opbeat.com/api/v1/organizations/${OPBEAT_FRONTEND_ORGANIZATION_ID}/apps/${OPBEAT_FRONTEND_APP_ID}/releases/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${OPBEAT_SECRET_TOKEN}`,
          },
          body: [
            `rev=${GIT_REVISION}`,
            `branch=${encodeURIComponent(GIT_BRANCH)}`,
            `machine=${encodeURIComponent(os.hostname())}`,
            `status=machine-completed`,
          ].join('&'),
        }
      );
      console.log(
        'Reported frontend deploy to Opbeat:',
        JSON.stringify(await res.json())
      );
    } catch (err) {
      // We swallow the error because we won't interrupt startup because we
      // couldn't report the release.
      console.error('Error reporting deploy to Opbeat');

      // bwaaaaaa
      opbeat.captureError(err);
    }
  }
}
