/* eslint no-console: 0 */

// Builds and deploys to AWS ECS
//
// Assumes docker and ecs-cli are installed.
//
// Meant to be run directly by Node without any npm packages,
// so that Travis can execute it from a clean environment.

const { spawn } = require('child_process');
const path = require('path');

function spawnPromise(bin, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      bin,
      args,
      Object.assign({}, { stdio: 'inherit' }, opts)
    );

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}

function getImageRepository(serviceName) {
  const repositoryPieces = [
    process.env['AWS_ECS_REGISTRY'],
    process.env['AWS_ECS_REPOSITORY_NAMESPACE'],
    serviceName,
  ];

  return repositoryPieces.filter(p => !!p).join('/');
}

// We tag the repositorys with the Travis build number, so we can trace that back
// (and because it’s nicely incrementing for sort) and the current Git commit so
// we know what version of the code it is.
function getBuildTag() {
  return process.env['TRAVIS_BUILD_NUMBER'] && process.env['TRAVIS_COMMIT']
    ? `${process.env['TRAVIS_BUILD_NUMBER']}-${process.env['TRAVIS_COMMIT']}`
    : 'dev';
}

function warmContainerCache(repository) {
  return spawnPromise('ecs-cli', [
    'pull',
    `${repository}:latest`,
  ]).catch(err => {
    console.log(
      `Error warming the container cache for ${repository}:latest. Ignoring.`,
      err
    );
  });
}

function buildContainer(repository, buildTag) {
  return spawnPromise(
    'docker',
    // we tag both the build and "latest" so we can download this later to
    // warm the cache
    [
      'build',
      '--file',
      path.resolve(__dirname, 'Dockerfile'),
      // --cache-from drastically speeds up builds when package.json doesn't
      // change, since it can re-use all of the npm install results.
      '--cache-from',
      `${repository}:latest`,
      '--tag',
      `${repository}:${buildTag}`,
      '--tag',
      `${repository}:latest`,
      '.',
    ]
  );
}

function pushContainer(repository, buildTag) {
  return Promise.resolve()
    .then(() => spawnPromise('ecs-cli', ['push', `${repository}:${buildTag}`]))
    .then(() => spawnPromise('ecs-cli', ['push', `${repository}:latest`]));
}

function deployService(serviceName, repository, buildTag) {
  if (!process.env['AWS_ECS_TASK_ROLE_ARN']) {
    throw new Error('AWS_ECS_TASK_ROLE_ARN not set');
  }

  if (!process.env['AWS_ECS_CLUSTER']) {
    throw new Error('AWS_ECS_CLUSTER not set');
  }

  if (!process.env['AWS_CLOUDWATCH_LOGS_GROUP']) {
    throw new Error('AWS_CLOUDWATCH_LOGS_GROUP not set');
  }

  if (!process.env['AWS_S3_CONFIG_BUCKET']) {
    throw new Error('AWS_S3_CONFIG_BUCKET not set');
  }

  return spawnPromise(
    'ecs-cli',
    [
      'compose',
      '--file',
      path.resolve(__dirname, 'docker-compose.yml'),
      '--project-name',
      serviceName,
      '--cluster',
      process.env.AWS_ECS_CLUSTER,
      '--task-role-arn',
      process.env.AWS_ECS_TASK_ROLE_ARN,
      'service',
      'up',
    ],
    {
      env: Object.assign({}, process.env, {
        // Used by docker-compose.yml
        SERVICE_IMAGE: `${repository}:${buildTag}`,
        AWS_S3_CONFIG_URL: `s3://${process.env
          .AWS_S3_CONFIG_BUCKET}/${serviceName}`,
        AWS_CLOUDWATCH_LOGS_GROUP: process.env.AWS_CLOUDWATCH_LOGS_GROUP,
        AWS_CLOUDWATCH_LOGS_PREFIX: serviceName,
      }),
      stdio: 'inherit',
    }
  );
}

(function() {
  if (!process.env['AWS_ECS_SERVICE_NAME']) {
    throw new Error(`Missing $AWS_ECS_SERVICE_NAME`);
  }

  const serviceName = process.env['AWS_ECS_SERVICE_NAME'];

  const repository = getImageRepository(serviceName);
  const buildTag = getBuildTag();

  Promise.resolve(true)
    .then(() => warmContainerCache(repository))
    .then(() => buildContainer(repository, buildTag))
    .then(() => pushContainer(repository, buildTag))
    .then(() => deployService(serviceName, repository, buildTag))
    .then(() => {
      console.log('Deploy successful.');
    })
    .catch(err => {
      console.error('ERROR DEPLOYING CONTAINER', err);
      process.exit(1);
    });
})();
