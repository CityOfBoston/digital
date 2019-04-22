/* eslint no-console: 0 */

import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import parseArgs from 'minimist';

import {
  BANNER,
  makePackageJsonTar,
  getRepository,
  pullImage,
  buildImage,
  pushImage,
  dockerAwsLogin,
  updateEcsService,
  waitForDeployment,
  deregisterTaskDefinition,
  updateServiceTaskDefinition,
  parseBranch,
  runNpmScript,
  runScopedLernaScript,
  runCommandInContainer,
} from './helpers';

const args = parseArgs(process.argv, { boolean: true });

const dockerfilePath = args._.pop()!;

const { environment, serviceName, variant } = parseBranch(
  process.env.DEPLOY_BRANCH!
);

// If true, runs Docker in the service’s own directory. Use for things like Ruby
// apps that don't pull in the whole JS monorepo.
const isolatedDocker = !!args['isolated-docker'];

const workspaceDir = isolatedDocker ? '.' : path.resolve('../..');
const cacheTag = 'latest';

(async function() {
  // await postTravisToSlack(__filename, 'start');

  const repository = await getRepository(environment, serviceName);

  const commit = (
    process.env.CODEBUILD_RESOLVED_SOURCE_VERSION ||
    Math.random()
      .toString(36)
      .substring(2, 15)
  ).substr(0, 8);
  // CodeBuild doesn’t have a build version number, so this is the best we can
  // do for a monotonically-increasing value.
  const buildNum = process.env.CODEBUILD_START_TIME || '0';

  console.error(BANNER);

  console.error(
    `🛫  Preparing to deploy service ${serviceName}${
      variant ? ` (${variant})` : ''
    } to ${environment}.`
  );
  console.error();

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  if (packageJson.scripts && packageJson.scripts.predeploy) {
    // We do run a yarn install for the whole repo during deploy. See
    // buildspec.yml. We still do run the "prepare" script though in case
    // "predeploy" requires packages to be compiled.
    console.error('🌬 Running predeploy script…');
    await runScopedLernaScript(packageJson.name, 'prepare');
    await runNpmScript('predeploy');
    console.error();
  }

  console.error('🔓 Logging in…');
  await dockerAwsLogin();
  console.error();

  if (!isolatedDocker) {
    console.error('🎁 Creating package-json.tar…');
    await makePackageJsonTar(workspaceDir);
    console.error();
  }

  const versionedTag = `${repository}:codebuild-${buildNum}-${commit}`;
  const buildTags = [`${repository}:${cacheTag}`, versionedTag];

  console.error('📻 Pulling previous image…');
  const pullResult = await pullImage(repository, cacheTag);
  if (!pullResult) {
    console.error('None found. Continuing without cache.');
  }

  console.error('');
  console.error('📸 Building container image…');

  await buildImage(
    workspaceDir,
    dockerfilePath,
    `${repository}:${cacheTag}`,
    buildTags
  );

  if (args['buildOnly']) {
    return;
  }

  if (packageJson.scripts && packageJson.scripts.postdeploy) {
    console.error('');

    console.error('🏹 Running postdeploy script in the container…');
    await runCommandInContainer(versionedTag, 'npm run postdeploy');
  }

  console.error('');

  console.error('🏹 Pushing image to repository…');

  for (let i = 0; i < buildTags.length; ++i) {
    await pushImage(buildTags[i]);
  }

  console.error();

  console.error(`🎟 Updating ${environment} service ${serviceName}…`);

  const ecsServiceName = `${serviceName}${variant ? `-${variant}` : ''}`;

  const updateServiceResult = await updateEcsService(
    environment,
    ecsServiceName,
    versionedTag,
    process.env.CODEBUILD_RESOLVED_SOURCE_VERSION || ''
  );
  console.error();

  const service = updateServiceResult.service;
  const deploymentId = updateServiceResult.deploymentId;
  const newTaskDefinitionArn = updateServiceResult.newTaskDefinitionArn;
  const oldTaskDefinitionArn = updateServiceResult.oldTaskDefinitionArn;

  console.error(`⌛️ Waiting for deploy: ${deploymentId}…`);

  try {
    await waitForDeployment(
      service,
      deploymentId,
      (e: AWS.ECS.ServiceEvent) => {
        console.error(format(e.createdAt!, 'h:mm:ssa'), e.message);
      }
    );
  } catch (e) {
    // await postTravisToSlack('error', e.message);

    if (oldTaskDefinitionArn) {
      console.error(e.message);
      console.error(`😿 Rolling back deployment to ${oldTaskDefinitionArn}…`);

      try {
        const rollbackInfo = await updateServiceTaskDefinition(
          environment,
          ecsServiceName,
          oldTaskDefinitionArn
        );

        await waitForDeployment(
          rollbackInfo.service,
          rollbackInfo.deploymentId,
          (e: AWS.ECS.ServiceEvent) => {
            console.error(format(e.createdAt!, 'h:mm:ssa'), e.message);
          }
        );
      } catch (e) {
        console.error(`🙍 Sigh. Even the rollback failed: ${e.message}`);
      }
      console.error();

      console.error(`👋 Deregistering broken task definition…`);
      await deregisterTaskDefinition(newTaskDefinitionArn);
      console.error();

      console.error(`⚰ Rollback complete. Exiting in failure.`);
      process.exit(-1);
    }

    throw e;
  }
  console.error();

  if (oldTaskDefinitionArn) {
    console.error(`🚽 Deregistering previous task definition…`);
    await deregisterTaskDefinition(oldTaskDefinitionArn);
    console.error();
  }

  // await postTravisToSlack(__filename, 'complete');

  console.error(
    `💅 Successfully deployed ${serviceName}${
      variant ? ` (${variant})` : ''
    } to ${environment}.`
  );
})().catch(e => {
  console.error(e);
  // postTravisToSlack('error', e.toString()).then(
  //   () => {
  //     process.exit(-1);
  //   },
  //   () => {
  //     process.exit(-1);
  //   }
  // );
  process.exit(-1);
});
