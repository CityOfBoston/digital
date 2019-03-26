// This is a script in the service, rather than a binary in deploy-tools,
// because binaries from our packages are not available in the container because
// of the order we do package.json / yarn install in the Dockerfile.

/* eslint no-console: 0 */
import path from 'path';

import {
  uploadToS3,
  parseBranch,
  uploadSourceMapsToRollbar,
  reportRollbarDeploy,
} from '@cityofboston/deploy-tools';

// Important for getting ASSET_HOST and ROLLBAR_ACCESS_TOKEN configuration. This
// script is run in the container from the default entrypoint, which would have
// downloaded the config files.
require('dotenv').config();

const NEXT_SRC_PATH = path.join('build', '.next');
const NEXT_DST_PATH = '_next';

const { environment, serviceName } = parseBranch(process.env.DEPLOY_BRANCH!);
const bucketEnvironment = environment === 'production' ? 'prod' : 'staging';
const bucket = `cob-digital-apps-${bucketEnvironment}-static`;

(async function() {
  console.error(`🛫  Uploading service ${serviceName} to ${bucket}…`);
  console.error();

  // Because all of Next’s JS is versioned, we don’t need to separate out these
  // uploads by variant. We can just push everything and anything that needs
  // separate file names will have it.
  await uploadToS3(
    NEXT_SRC_PATH,
    bucket,
    `${serviceName}/${NEXT_DST_PATH}`,
    // 1 year cache expiration because all of Next’s JS is versioned
    60 * 60 * 24 * 365
  );

  console.error();

  console.error(`💅 Successfully uploaded ${serviceName} to ${bucket}.`);

  console.error();

  const externalAssetUrl = process.env.ASSET_HOST
    ? `https://${process.env.ASSET_HOST}/${serviceName}`
    : `https://${process.env.PUBLIC_HOST}`;

  const rollbarAccessToken = process.env.ROLLBAR_ACCESS_TOKEN;
  if (rollbarAccessToken) {
    console.error(`🗺  Uploading source maps to Rollbar.`);
    console.error();

    await uploadSourceMapsToRollbar({
      rollbarAccessToken,
      // These are scoped to "static" so that we don't waste time uploading the
      // server maps to Rollbar.
      dir: path.resolve(path.join(NEXT_SRC_PATH, 'static')),
      baseUrl: `${externalAssetUrl}/${NEXT_DST_PATH}/static`,
      version: process.env.GIT_REVISION || '',
    });

    console.error(`🍾  Reporting deploy to Rollbar.`);
    console.error();

    await reportRollbarDeploy(
      rollbarAccessToken,
      process.env.GIT_REVISION || 'HEAD'
    );

    console.error(`📮  post-deploy script successful!`);
    console.error();
  }
})().catch(e => {
  console.error(e);
  process.exit(-1);
});
