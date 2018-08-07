/* eslint no-console: 0 */

import path from 'path';
import { format } from 'date-fns';

import {
  BANNER,
  makePackageJsonTar,
  getRepository,
  pullImage,
  buildImage,
  pushImage,
  dockerAwsLogin,
  updateStagingService,
  updateProdService,
  waitForDeployment,
  deregisterTaskDefinition,
  updateServiceTaskDefinition,
  postToSlack,
  parseBranch,
} from './helpers';

const [dockerfilePath] = process.argv.slice(2);

const { environment, serviceName, variant } = parseBranch();

const workspaceDir = path.resolve('../..');
const cacheTag = 'latest';

(async function() {
  await postToSlack('start');

  const repository = await getRepository(environment, serviceName);

  const commit = (
    process.env.TRAVIS_COMMIT ||
    Math.random()
      .toString(36)
      .substring(2, 15)
  ).substr(0, 8);
  const buildNum = process.env.TRAVIS_BUILD_NUMBER || '0';

  console.error(BANNER);

  console.error(
    `🛫  Preparing to deploy service ${serviceName}${
      variant ? ` (${variant})` : ''
    } to ${environment}.`
  );
  console.error();

  console.error('🔓 Logging in…');
  await dockerAwsLogin();
  console.error();

  console.error('🎁 Creating package-json.tar…');
  await makePackageJsonTar(workspaceDir);

  const versionedTag =
    environment === 'production'
      ? `${repository}:travis-${buildNum}-${commit}`
      : `${repository}:deploy-${variant || 'default'}`;
  const buildTags = [`${repository}:${cacheTag}`, versionedTag];

  console.error();
  console.error('📻 Pulling previous image…');
  const result = await pullImage(repository, cacheTag);
  if (!result) {
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

  console.error('');

  console.error('🏹 Pushing image to repository…');

  for (let i = 0; i < buildTags.length; ++i) {
    await pushImage(buildTags[i]);
  }

  console.error();

  let service;
  let deploymentId;
  let newTaskDefinitionArn;
  let oldTaskDefinitionArn;

  if (environment === 'staging') {
    const ecsServiceName = `${serviceName}${variant ? `-${variant}` : ''}`;
    console.error(`🎟 Updating staging service ${ecsServiceName}…`);

    const result = await updateStagingService(ecsServiceName);
    console.error();

    service = result.service;
    deploymentId = result.deploymentId;
  } else {
    console.error(`🎟 Updating production service ${serviceName}…`);

    const result = await updateProdService(serviceName, versionedTag);
    console.error();

    service = result.service;
    deploymentId = result.deploymentId;
    newTaskDefinitionArn = result.newTaskDefinitionArn;
    oldTaskDefinitionArn = result.oldTaskDefinitionArn;
  }

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
    await postToSlack('error', e.message);

    if (oldTaskDefinitionArn) {
      console.error(e.message);
      console.error(`😿 Rolling back deployment to ${oldTaskDefinitionArn}…`);

      try {
        const rollbackInfo = await updateServiceTaskDefinition(
          environment,
          serviceName,
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

  await postToSlack('complete');

  console.error(
    `💅 Successfully deployed ${serviceName}${
      variant ? ` (${variant})` : ''
    } to ${environment}.`
  );
})().catch(e => {
  console.error(e);
  postToSlack('error', e.toString()).finally(() => {
    process.exit(-1);
  });
});
