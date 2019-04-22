/* eslint no-console: 0 */

import fs from 'fs';
import parseArgs from 'minimist';

import {
  BANNER,
  uploadToS3,
  downloadFromS3,
  parseBranch,
  runNpmScript,
  runScopedLernaScript,
  yarnInstall,
} from './helpers';

const args = parseArgs(process.argv, { boolean: true });
const buildDirPath = args._.pop()!;

const { environment, serviceName, variant } = parseBranch(
  process.env.DEPLOY_BRANCH!
);
const bucketEnvironment = environment === 'production' ? 'prod' : 'staging';
const bucket = `cob-digital-apps-${bucketEnvironment}-static`;
const configBucket = `cob-digital-apps-${bucketEnvironment}-config`;

(async function() {
  console.error(BANNER);

  if (variant) {
    throw new Error('S3 deploy does not support variants');
  }

  console.error('🎢 Downloading configuration…');
  await downloadFromS3(configBucket, serviceName);
  console.error();

  // We don't install packages by default because they’re not needed in the
  // container-building case. But we do need them for s3 building, so we do that
  // now.
  console.error('🧶 yarn install…');
  await yarnInstall();
  console.error();

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  if (packageJson.scripts && packageJson.scripts.predeploy) {
    // We do run a yarn install for the whole repo during deploy. See
    // .travis.yml or buildspec.yml. We still do run the "prepare" script though
    // in case "predeploy" requires packages to be compiled.
    console.error('🌬 Running predeploy script…');
    await runScopedLernaScript(packageJson.name, 'prepare');
    await runNpmScript('predeploy');
    console.error();
  } else {
    // "prepare" will cause the app to be built
    console.error('🌬 Running prepare script…');
    await runScopedLernaScript(packageJson.name, 'prepare');
    console.error();
  }

  console.error(`🛫  Preparing to upload service ${serviceName} to ${bucket}.`);
  console.error();

  await uploadToS3(buildDirPath, bucket, serviceName);
  console.error();

  console.error(`💅 Successfully uploaded ${serviceName} to ${bucket}.`);
})().catch(e => {
  console.error(e);
  process.exit(-1);
});
