/* eslint no-console: 0 */

import fs from 'fs';
import parseArgs from 'minimist';

import {
  BANNER,
  uploadToS3,
  postToSlack,
  parseBranch,
  runNpmScript,
  runScopedLernaScript,
} from './helpers';

const args = parseArgs(process.argv, { boolean: true });
const buildDirPath = args._.pop()!;

const { environment, serviceName, variant } = parseBranch();
const bucketEnvironment = environment === 'production' ? 'prod' : 'staging';
const bucket = `cob-digital-apps-${bucketEnvironment}-static`;

(async function() {
  await postToSlack('start');

  console.error(BANNER);

  if (variant) {
    throw new Error('S3 deploy does not support variants');
  }

  console.error(`🛫  Preparing to upload service ${serviceName} to ${bucket}.`);
  console.error();

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  if (packageJson.scripts && packageJson.scripts.predeploy) {
    // We do run a yarn install for the whole repo during deploy. See
    // .travis.yml. We still do run the "prepare" script though in case
    // "predeploy" requires packages to be compiled.
    console.error('🌬 Running predeploy script…');
    await runScopedLernaScript(serviceName, 'prepare');
    await runNpmScript('predeploy');
    console.error();
  } else {
    // "prepare" will cause the app to be built
    console.error('🌬 Running prepare script…');
    await runScopedLernaScript(serviceName, 'prepare');
    console.error();
  }

  await uploadToS3(buildDirPath, bucket, serviceName);
  console.error();

  await postToSlack('s3-complete');

  console.error(`💅 Successfully uploaded ${serviceName} to ${bucket}.`);
})().catch(e => {
  console.error(e);
  postToSlack('error', e.toString()).then(
    () => {
      process.exit(-1);
    },
    () => {
      process.exit(-1);
    }
  );
});
