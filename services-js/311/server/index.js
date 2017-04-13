// @flow
/* eslint no-console: 0 */

// We use require in here so we can be deliberate about load order.

require('dotenv').config();

const opbeat = require('opbeat').start({
  appId: process.env.OPBEAT_APP_ID,
  organizationId: process.env.OPBEAT_ORGANIZATION_ID,
  secretToken: process.env.OPBEAT_SECRET_TOKEN,
  active: process.env.NODE_ENV === 'production',
});

require('./server').default({ opbeat }).catch((err) => {
  opbeat.captureError(err, (e, url) => {
    if (e) {
      console.error('Error sending exception to Opbeat', e);
    } else if (url) {
      console.info(`Error logged to Opbeat: ${url}`);
    }
  });

  console.error('Error starting server');
  console.error(err);
});
